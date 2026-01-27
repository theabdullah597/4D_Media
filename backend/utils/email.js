const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
let transporter = null;

function createTransporter() {
  if (!config.smtp.auth.user || !config.smtp.auth.pass) {
    console.warn('SMTP credentials not configured. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass
    }
  });
}

/**
 * Send order confirmation email to admin
 */
async function sendOrderNotification(order, orderItems) {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    if (!transporter) {
      console.log('Email not sent: SMTP not configured');
      return { success: false, message: 'SMTP not configured' };
    }

    // Build order items HTML
    let itemsHtml = '';
    for (const item of orderItems) {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size || 'N/A'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.color || 'N/A'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    }

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #6366f1; }
          .order-table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
          .order-table th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; }
          .total { font-size: 18px; font-weight: bold; color: #6366f1; text-align: right; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Order Received!</h1>
            <p style="margin: 5px 0 0 0;">Order #${order.order_number}</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <h3 style="margin-top: 0; color: #6366f1;">Customer Information</h3>
              <p><strong>Name:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Phone:</strong> ${order.customer_phone}</p>
              <p><strong>Address:</strong> ${order.delivery_address}</p>
              ${order.delivery_city ? `<p><strong>City:</strong> ${order.delivery_city}</p>` : ''}
              ${order.order_notes ? `<p><strong>Notes:</strong> ${order.order_notes}</p>` : ''}
            </div>

            <h3 style="color: #6366f1;">Order Details</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <p class="total">Total Amount: $${order.total_amount.toFixed(2)}</p>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 20px;">
              <p style="margin: 0;"><strong>⚠️ Action Required:</strong></p>
              <p style="margin: 5px 0 0 0;">Please login to the admin panel to view design files and update order status.</p>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated message from 4D Media Order System</p>
            <p>Order placed on ${new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"4D Media Orders" <${config.smtp.auth.user}>`,
      to: config.adminEmail,
      replyTo: order.customer_email,
      subject: `New Order #${order.order_number} - ${order.customer_name}`,
      html: htmlContent
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify SMTP connection
 */
async function verifyConnection() {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    if (!transporter) {
      return { success: false, message: 'SMTP not configured' };
    }

    await transporter.verify();
    console.log('SMTP connection verified');
    return { success: true, message: 'SMTP connection verified' };
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderNotification,
  verifyConnection
};
