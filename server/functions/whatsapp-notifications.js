
const db = require('./db');
const queries = require('./queries');
const axios = require('axios');

/**
 * Logs a WhatsApp message attempt to the database.
 * This is a "fire-and-forget" function and will not throw errors to the caller.
 */
async function logWhatsappMessage({ recipientNumber, messageContent, status, reason, orderId, userId, messageType }) {
  try {
    // For template messages, messageContent is an object. Stringify it for logging.
    const contentToLog = typeof messageContent === 'object' ? JSON.stringify(messageContent) : messageContent;
    await db.query(queries.whatsapp.logMessage, [
      recipientNumber,
      contentToLog,
      status,
      reason,
      orderId,
      userId,
      messageType
    ]);
  } catch (error) {
    console.error("❌ Failed to log WhatsApp message to DB:", error);
  }
}

/**
 * Fetches the application settings from the database.
 */
async function getSettings() {
  try {
    const { rows } = await db.query(queries.settings.getSettings);
    return rows[0]?.data || {};
  } catch (error) {
    console.error("❌ Failed to fetch settings:", error);
    return {};
  }
}

/**
 * Formats a phone number for the WhatsApp Graph API.
 * Ensures it starts with the country code '91' and has no special characters.
 */
const formatPhone = (number) => {
  if (!number) return null;
  const cleaned = number.replace(/\s/g, '').replace(/\+/g, '');
  return cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
};

/**
 * Formats a date to "dd MMM yyyy h:mm AM/PM" format.
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
};

/**
 * Builds an ordered array of parameter values based on a mapping string from settings.
 * This is crucial for correctly populating WhatsApp template variables like {{1}}, {{2}}, etc.
 * @param {string} paramMapping - A comma-separated string of placeholders, e.g., "[CUSTOMER_NAME],[ORDER_ID]".
 * @param {object} availableValues - A dictionary of all possible placeholder values for the current context.
 * @returns {string[]} An array of parameter values in the correct order specified by paramMapping.
 */
function buildTemplateParameters(paramMapping, availableValues) {
  // FIX: Trim the mapping string first. If it's empty or just whitespace, it means there are no parameters.
  // This prevents an array with an empty string [''] from being created.
  if (!paramMapping || !paramMapping.trim()) {
      return [];
  }
  
  return paramMapping
    .split(',')
    .map(key => key.trim())
    // Add a filter to remove any empty strings that might result from trailing commas (e.g., "val1,val2,").
    .filter(key => key) 
    .map(key => {
        // Provide a default fallback if a placeholder is not found, to avoid sending 'undefined'.
        const value = availableValues[key];
        return value !== undefined && value !== null ? String(value) : ' '; // WhatsApp requires a non-empty string.
    });
}


/**
 * Dispatches a WhatsApp message. It can simulate messages for testing or send real
 * template-based messages via the Facebook Graph API.
 * @param {string} recipientNumber - The destination phone number.
 * @param {string} templateName - The name of the approved WhatsApp template.
 * @param {string[]} parameters - An ordered array of values to fill template variables.
 * @param {object} notificationSettings - The WhatsApp settings object from the database.
 * @param {string[]} [buttonParameters] - An ordered array of values to fill button variables (e.g. dynamic URLs).
 * @param {string[]} [headerParameters] - An ordered array of values to fill header variables.
 * @returns {Promise<object>} A result object with success status and a reason.
 */
async function sendWhatsappMessage(recipientNumber, templateName, parameters, notificationSettings, buttonParameters = [], headerParameters = []) {
  if (!notificationSettings?.enableOrderNotifications) {
    const reason = "WhatsApp notifications are disabled in settings.";
    console.log(`[SERVER] ⚠️ Skipping WhatsApp notification: ${reason}`);
    return { success: false, reason };
  }
  
  const { apiProvider } = notificationSettings;

  // --- MOCK SERVER LOGIC ---
  if (apiProvider === 'mock_server') {
    if (!recipientNumber) return { success: false, reason: "Recipient phone number is missing." };
    console.log(`\n--- [SERVER] SIMULATING WHATSAPP TEMPLATE MESSAGE ---`);
    console.log(`[SERVER] To: ${recipientNumber}`);
    console.log(`[SERVER] Template Name: ${templateName}`);
    console.log(`[SERVER] Body Parameters: ${JSON.stringify(parameters)}`);
    if (headerParameters && headerParameters.length > 0) {
      console.log(`[SERVER] Header Parameters: ${JSON.stringify(headerParameters)}`);
    }
    if (buttonParameters && buttonParameters.length > 0) {
      console.log(`[SERVER] Button Parameters: ${JSON.stringify(buttonParameters)}`);
    }
    console.log('--- SIMULATION END ---\n');
    return { success: true, reason: 'Simulated successfully' };
  }
  
  // --- FACEBOOK GRAPH API LOGIC ---
  if (apiProvider === 'graph_api') {
    const { whatsappToken, whatsappPhoneId, whatsappVersion } = notificationSettings;

    if (!whatsappToken || !whatsappPhoneId || !whatsappVersion || !templateName) {
      const reason = "WhatsApp Graph API settings (Token, Phone ID, Version, or Template Name) are missing.";
      console.error(`[SERVER] ❌ WhatsApp error: ${reason}`);
      return { success: false, reason };
    }

    const formattedPhone = formatPhone(recipientNumber);
    if (!formattedPhone) {
      const reason = `Invalid recipient phone number: ${recipientNumber}`;
      console.error(`[SERVER] ❌ WhatsApp error: ${reason}`);
      return { success: false, reason };
    }

    const url = `https://graph.facebook.com/${whatsappVersion}/${whatsappPhoneId}/messages`;
    
    // Base payload for a template message.
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" }, // Language code should match the template's language.
        components: []
      }
    };

    // Add header parameters if they exist
    if (headerParameters && headerParameters.length > 0) {
      payload.template.components.push({
        type: 'header',
        parameters: headerParameters.map(p => ({ type: 'text', text: p }))
      });
    }

    // Add body parameters if they exist
    if (parameters.length > 0) {
      payload.template.components.push({
        type: 'body',
        parameters: parameters.map(p => ({ type: 'text', text: p }))
      });
    }

    // Add button parameters if they exist
    // Assuming button type is 'url' and index is 0 for the first button
    if (buttonParameters && buttonParameters.length > 0) {
      buttonParameters.forEach((param, index) => {
         payload.template.components.push({
          type: 'button',
          sub_type: 'url',
          index: index.toString(), // Index of the button in the template (0, 1, 2)
          parameters: [
            {
              type: 'text',
              text: param // The dynamic part of the URL
            }
          ]
        });
      });
    }
    
    // Remove components array if empty to avoid API errors
    if (payload.template.components.length === 0) {
        delete payload.template.components;
    }

    const headers = { Authorization: `Bearer ${whatsappToken}`, "Content-Type": "application/json" };

    try {
      await axios.post(url, payload, { headers });
      console.log(`✅ WhatsApp template '${templateName}' sent to: ${formattedPhone}`);
      return { success: true, reason: 'Message sent via Graph API.' };
    } catch (err) {
      const errorMessage = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.error(`❌ WhatsApp template send error for '${templateName}':`, errorMessage);
      return { success: false, reason: `Graph API Error: ${errorMessage}` };
    }
  }

  // Fallback for 'none' or unsupported providers
  const reason = `Provider '${apiProvider}' is 'none' or not supported.`;
  console.log(`[SERVER] ⚠️ Skipping WhatsApp notification: ${reason}`);
  return { success: false, reason };
}


/**
 * Sends notifications for a newly created order to both the customer and admin
 * by building and dispatching the appropriate templates.
 */
async function sendNewOrderNotifications(order) {
  const settings = await getSettings();
  const { whatsappNotifications: ns } = settings;

  if (!ns?.enableOrderNotifications) return;

  // A dictionary of all possible dynamic values for this event.
  const availablePlaceholders = {
    '[ORDER_ID]': order.id,
    '[CUSTOMER_NAME]': order.customerName,
    '[CUSTOMER_PHONE]': order.customerPhone,
    '[TOTAL_AMOUNT]': `₹${order.totalAmount}`,
    '[ORDER_LINK]': `${process.env.APP_URL}/admin/orders/${order.id}`, // Admin link
    '[ORDER_LINK_SUFFIX]': `admin/orders/${order.id}`, // Suffix for button
    '[PRODUCT_LIST]': order.items?.map(item => `${item.quantity}x ${item.productName}`).join(', ') || 'Items',
    '[WEBSITE_NAME]': settings.general?.websiteName || '3D Hub',
    '[PAYMENT_STATUS]': order.paymentDetails ? 'Paid' : 'Pending',
    '[ORDER_DATE]': formatDate(order.orderDate || new Date()),
    '[SHIPPING_ADDRESS]': typeof order.shippingAddress === 'object' ? 
      (order.shippingAddress.pickupMethod === 'pickup' ? 'Self Pickup' : `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`) 
      : order.shippingAddress || 'N/A',
  };

  // 1. Send to Customer
  if (order.customerPhone && ns.customerNewOrderTemplateName) {
    // Hardcoded parameters for 'order_Placed' template
    // [CUSTOMER_NAME],[WEBSITE_NAME],[ORDER_ID],[TOTAL_AMOUNT],[PAYMENT_STATUS],[WEBSITE_NAME]
    const customerParams = [
      String(availablePlaceholders['[CUSTOMER_NAME]'] || 'Customer'),
      String(availablePlaceholders['[WEBSITE_NAME]'] || '3D Hub'),
      String(availablePlaceholders['[ORDER_ID]'] || order.id),
      String(availablePlaceholders['[TOTAL_AMOUNT]'] || '0'),
      String(availablePlaceholders['[PAYMENT_STATUS]'] || 'Pending'),
      String(availablePlaceholders['[WEBSITE_NAME]'] || '3D Hub')
    ];

    const result = await sendWhatsappMessage(order.customerPhone, ns.customerNewOrderTemplateName, customerParams, ns);
    await logWhatsappMessage({
      recipientNumber: order.customerPhone,
      messageContent: { template: ns.customerNewOrderTemplateName, params: customerParams },
      status: result.success ? 'success' : 'failed',
      reason: result.reason,
      orderId: order.id,
      userId: order.user_id,
      messageType: 'new_order_customer'
    });
  }
  
  // 2. Send to Admin
  if (ns.adminPhoneNumber && ns.adminNewOrderTemplateName) {
    // Hardcoded parameters for admin new order template
    // [CUSTOMER_NAME],[CUSTOMER_PHONE],[ORDER_ID],[TOTAL_AMOUNT],[PAYMENT_STATUS],[ORDER_DATE],[SHIPPING_ADDRESS]
    const adminParams = [
      String(availablePlaceholders['[CUSTOMER_NAME]'] || 'Customer'),
      String(availablePlaceholders['[CUSTOMER_PHONE]'] || 'N/A'),
      String(availablePlaceholders['[ORDER_ID]'] || order.id),
      String(availablePlaceholders['[TOTAL_AMOUNT]'] || '0'),
      String(availablePlaceholders['[PAYMENT_STATUS]'] || 'Pending'),
      String(availablePlaceholders['[ORDER_DATE]'] || 'N/A'),
      String(availablePlaceholders['[SHIPPING_ADDRESS]'] || 'N/A')
    ];
    
    // Button parameter for admin to view order
    const adminButtonParams = [
        String(availablePlaceholders['[ORDER_LINK_SUFFIX]'])
    ];

    const result = await sendWhatsappMessage(ns.adminPhoneNumber, ns.adminNewOrderTemplateName, adminParams, ns, adminButtonParams);
    await logWhatsappMessage({
      recipientNumber: ns.adminPhoneNumber,
      messageContent: { template: ns.adminNewOrderTemplateName, params: adminParams, buttonParams: adminButtonParams },
      status: result.success ? 'success' : 'failed',
      reason: result.reason,
      orderId: order.id,
      userId: order.user_id,
      messageType: 'new_order_admin'
    });
  }
}

/**
 * Sends a notification when an order's status is updated by building and
 * dispatching the appropriate template.
 */
async function sendOrderStatusUpdate(orderId, newStatus, shippingInfo) {
  const settings = await getSettings();
  const { whatsappNotifications: ns } = settings;

  if (!ns?.enableOrderNotifications) return;

  const orderResult = await db.query("SELECT id, customer_name AS \"customerName\", customer_phone AS \"customerPhone\", total_amount AS \"totalAmount\", payment_details AS \"paymentDetails\", order_date AS \"orderDate\", user_id FROM orders WHERE id = $1", [orderId]);
  if (orderResult.rows.length === 0) {
    console.error(`[SERVER] Could not find order ${orderId} to send status update.`);
    return;
  }
  const order = orderResult.rows[0];

  let templateName = "";
  
  // Select the correct template name based on the new status.
  if (newStatus === "Processing") {
      templateName = ns.customerProcessingTemplateName;
  } else if (newStatus === "Shipped") {
      templateName = ns.customerShippedTemplateName;
  } else if (newStatus === "Delivered") {
      templateName = ns.customerDeliveredTemplateName;
  } else if (newStatus === "Cancelled") {
      templateName = ns.customerCancelledTemplateName;
  } else {
      // Fallback to a generic status update template if defined
      templateName = ns.orderStatusUpdateTemplateName || "";
  }

  if (!templateName) {
    console.log(`[SERVER] ⚠️ Template name missing in settings for status: ${newStatus}`);
    return;
  }

  // A dictionary of all possible dynamic values for this event.
  const availablePlaceholders = {
    '[ORDER_ID]': order.id,
    '[CUSTOMER_NAME]': order.customerName,
    '[CARRIER]': shippingInfo?.carrier || 'our courier partner',
    '[TRACKING_NUMBER]': shippingInfo?.trackingNumber || 'N/A',
    '[ORDER_LINK]': `${process.env.APP_URL}/orders/${order.id}`,
    '[ORDER_LINK_SUFFIX]': `orders/${order.id}`,
    '[WEBSITE_NAME]': settings.general?.websiteName || 'Our Store',
    '[ORDER_STATUS]': newStatus,
    '[UPDATE_TIME]': formatDate(new Date()),
    '[TOTAL_AMOUNT]': `₹${order.totalAmount}`,
    '[PAYMENT_STATUS]': order.paymentDetails ? (typeof order.paymentDetails === 'string' ? JSON.parse(order.paymentDetails).status : order.paymentDetails.status) || 'Paid' : 'Pending',
    '[SHIPPING_DETAILS]': newStatus === 'Shipped' ? `Your order has been shipped via ${shippingInfo?.carrier || 'our partner'} with tracking ID: ${shippingInfo?.trackingNumber || 'N/A'}.` : `Your order status is now: ${newStatus}`,
  };
  
  // Hardcoded parameters for status updates
  // [CUSTOMER_NAME],[WEBSITE_NAME],[ORDER_ID],[ORDER_STATUS],[TOTAL_AMOUNT],[PAYMENT_STATUS],[SHIPPING_DETAILS],[WEBSITE_NAME]
  const parameters = [
    String(availablePlaceholders['[CUSTOMER_NAME]'] || 'Customer'),
    String(availablePlaceholders['[WEBSITE_NAME]'] || '3D Hub'),
    String(availablePlaceholders['[ORDER_ID]'] || order.id),
    String(availablePlaceholders['[ORDER_STATUS]'] || newStatus),
    String(availablePlaceholders['[TOTAL_AMOUNT]'] || '0'),
    String(availablePlaceholders['[PAYMENT_STATUS]'] || 'Pending'),
    String(availablePlaceholders['[SHIPPING_DETAILS]'] || 'N/A'),
    String(availablePlaceholders['[WEBSITE_NAME]'] || '3D Hub')
  ];

  // Button parameter for customer to view/track order
  const buttonParameters = [
    String(availablePlaceholders['[ORDER_LINK_SUFFIX]'])
  ];

  // Header parameter (e.g., Order Status or Order ID)
  // Using Order Status as it's a "Status Update" notification
  const headerParameters = [
    String(availablePlaceholders['[ORDER_STATUS]'] || newStatus)
  ];

  const result = await sendWhatsappMessage(order.customerPhone, templateName, parameters, ns, buttonParameters, headerParameters);
  await logWhatsappMessage({
    recipientNumber: order.customerPhone,
    messageContent: { template: templateName, params: parameters, buttonParams: buttonParameters, headerParams: headerParameters },
    status: result.success ? 'success' : 'failed',
    reason: result.reason,
    orderId: order.id,
    userId: order.user_id,
    messageType: `status_update_${newStatus.toLowerCase()}`
  });
}

module.exports = {
  sendNewOrderNotifications,
  sendOrderStatusUpdate,
};