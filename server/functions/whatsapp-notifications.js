
const db = require('./db');
const queries = require('./queries');
const axios = require('axios');

/**
 * Logs a WhatsApp message attempt to the database.
 * This is a "fire-and-forget" function and will not throw errors to the caller.
 */
async function logWhatsappMessage({ recipientNumber, messageContent, status, reason, orderId, userId, messageType }) {
  try {
    console.log("*******",  recipientNumber,
      messageContent,
      status,
      reason,
      orderId,
      userId,
      messageType);
    // await db.query(queries.whatsapp.logMessage, [
    //   recipientNumber,
    //   messageContent,
    //   status,
    //   reason,
    //   orderId,
    //   userId,
    //   messageType
    // ]);
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
 * Dispatches a WhatsApp message based on the configured API provider.
 * Can simulate messages or send real ones via the Facebook Graph API.
 */
async function sendWhatsappMessage(recipientNumber, message, notificationSettings) {
  if (!notificationSettings?.enableOrderNotifications) {
    const reason = "WhatsApp notifications are disabled in settings.";
    console.log(`[SERVER] ⚠️ Skipping WhatsApp notification: ${reason}`);
    return { success: false, reason };
  }
  
  const { apiProvider } = notificationSettings;

  if (apiProvider === 'mock_server') {
    if (!recipientNumber) {
      const reason = "Recipient phone number is missing.";
      return { success: false, reason };
    }
    console.log(`\n--- [SERVER] SIMULATING WHATSAPP MESSAGE ---`);
    console.log(`[SERVER] To: ${recipientNumber}`);
    console.log(`[SERVER] Message: ${message}`);
    console.log('--- SIMULATION END ---\n');
    return { success: true, reason: 'Simulated successfully' };
  }
  
  if (apiProvider === 'graph_api') {
    const { whatsappToken, whatsappPhoneId, whatsappVersion } = notificationSettings;

    if (!whatsappToken || !whatsappPhoneId || !whatsappVersion) {
      const reason = "WhatsApp Graph API settings (Token, Phone ID, Version) are not configured in the admin panel.";
      console.error(`[SERVER] ❌ WhatsApp error: ${reason}`);
      return { success: false, reason };
    }

    const formattedPhone = formatPhone(recipientNumber);
    if (!formattedPhone) {
      const reason = `Invalid recipient phone number: ${recipientNumber}`;
      console.error(`[SERVER] ❌ WhatsApp error: ${reason}`);
      return { success: false, reason };
    }

    const url = `https://graph.facebook.com/v22.0/898671220007214/messages`;
    const payload = {
  "messaging_product": "whatsapp",
  "to": "919597935647",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
};
    const headers = {
      Authorization: `Bearer ${whatsappToken}`,
      "Content-Type": "application/json"
    };

    try {
      await axios.post(url, payload, { headers });
      console.log("✅ WhatsApp sent to:", formattedPhone);
      return { success: true, reason: 'Message sent via Graph API.' };
    } catch (err) {
      const errorMessage = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.error("❌ WhatsApp send error:", errorMessage);
      return { success: false, reason: `Graph API Error: ${errorMessage}` };
    }
  }

  const reason = `Provider '${apiProvider}' is 'none' or not supported.`;
  console.log(`[SERVER] ⚠️ Skipping WhatsApp notification: ${reason}`);
  return { success: false, reason };
}


/**
 * Sends notifications for a newly created order to both the customer and admin.
 */
async function sendNewOrderNotifications(order) {
  const settings = await getSettings();
  const { whatsappNotifications: notificationSettings } = settings;

  if (!notificationSettings?.enableOrderNotifications) return;

  const placeholders = {
    '[ORDER_ID]': order.id,
    '[CUSTOMER_NAME]': order.customerName,
    '[TOTAL_AMOUNT]': order.totalAmount.toString(),
  };

  const replacePlaceholders = (template) => 
    template.replace(/\[ORDER_ID\]|\[CUSTOMER_NAME\]|\[TOTAL_AMOUNT\]/g, match => placeholders[match]);

  // 1. Send to Customer
  if (order.customerPhone && notificationSettings.customerOrderMessage) {
    const customerMessage = replacePlaceholders(notificationSettings.customerOrderMessage);
    const result = await sendWhatsappMessage(order.customerPhone, customerMessage, notificationSettings);
    await logWhatsappMessage({
      recipientNumber: order.customerPhone,
      messageContent: customerMessage,
      status: result.success ? 'success' : 'failed',
      reason: result.reason,
      orderId: order.id,
      userId: order.user_id,
      messageType: 'new_order_customer'
    });
  }
  
  // 2. Send to Admin
  if (notificationSettings.adminPhoneNumber && notificationSettings.adminOrderMessage) {
    const adminMessage = replacePlaceholders(notificationSettings.adminOrderMessage);
    const result = await sendWhatsappMessage(notificationSettings.adminPhoneNumber, adminMessage, notificationSettings);
    await logWhatsappMessage({
      recipientNumber: notificationSettings.adminPhoneNumber,
      messageContent: adminMessage,
      status: result.success ? 'success' : 'failed',
      reason: result.reason,
      orderId: order.id,
      userId: order.user_id,
      messageType: 'new_order_admin'
    });
  }
}

/**
 * Sends a notification when an order's status is updated.
 */
async function sendOrderStatusUpdate(orderId, newStatus, shippingInfo) {
  const settings = await getSettings();
  const { whatsappNotifications: notificationSettings } = settings;

  if (!notificationSettings?.enableOrderNotifications) return;

  const orderResult = await db.query("SELECT id, customer_name AS \"customerName\", customer_phone AS \"customerPhone\", user_id FROM orders WHERE id = $1", [orderId]);
  if (orderResult.rows.length === 0) {
    console.error(`[SERVER] Could not find order ${orderId} to send status update.`);
    return;
  }
  const order = orderResult.rows[0];

  let template = "";
  switch (newStatus) {
    case "Processing": template = notificationSettings.customerOrderProcessingMessage; break;
    case "Shipped": template = notificationSettings.customerOrderShippedMessage; break;
    case "Delivered": template = notificationSettings.customerOrderDeliveredMessage; break;
    case "Cancelled": template = notificationSettings.customerOrderCancelledMessage; break;
    default: return;
  }

  if (!template) {
    console.log(`[SERVER] ⚠️ Template missing for status: ${newStatus}`);
    return;
  }

  const placeholders = {
    '[ORDER_ID]': order.id,
    '[CUSTOMER_NAME]': order.customerName,
    '[CARRIER]': shippingInfo?.carrier || 'our courier partner',
    '[TRACKING_NUMBER]': shippingInfo?.trackingNumber || 'N/A',
  };
  
  const customerMessage = template.replace(/\[ORDER_ID\]|\[CUSTOMER_NAME\]|\[CARRIER\]|\[TRACKING_NUMBER\]/g, match => placeholders[match]);

  const result = await sendWhatsappMessage(order.customerPhone, customerMessage, notificationSettings);
  await logWhatsappMessage({
    recipientNumber: order.customerPhone,
    messageContent: customerMessage,
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