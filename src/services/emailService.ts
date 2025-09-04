// Servicio para enviar emails usando Resend
// Nota: Necesitarás configurar Resend y obtener una API key

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface NotificationEmailData {
  to: string;
  title: string;
  message: string;
  type: string;
  category: string;
  metadata?: Record<string, any>;
}

export const emailService = {
  // Enviar email básico
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Aquí usarías la API de Resend
      // Por ahora simulamos el envío
      console.log('Enviando email:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from || 'noreply@aw-legal.com'
      });

      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  },

  // Enviar notificación por email
  async sendNotificationEmail(emailData: NotificationEmailData): Promise<boolean> {
    const subject = `[AW Legal] ${emailData.title}`;
    
    const html = this.generateNotificationEmailHTML(emailData);

    return this.sendEmail({
      to: emailData.to,
      subject,
      html,
      from: 'notificaciones@aw-legal.com'
    });
  },

  // Generar HTML para email de notificación
  generateNotificationEmailHTML(data: NotificationEmailData): string {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'success': return '#10B981';
        case 'warning': return '#F59E0B';
        case 'error': return '#EF4444';
        case 'payment': return '#8B5CF6';
        case 'milestone': return '#3B82F6';
        default: return '#6B7280';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        case 'payment': return '💰';
        case 'milestone': return '🎯';
        default: return 'ℹ️';
      }
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #660913 0%, #4b0a12 100%);
            color: white;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 32px 24px;
          }
          .notification {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid ${getTypeColor(data.type)};
          }
          .icon {
            font-size: 24px;
            flex-shrink: 0;
          }
          .notification-content h2 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          }
          .notification-content p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            padding: 24px;
            text-align: center;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            background-color: #660913;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin-top: 16px;
          }
          .button:hover {
            background-color: #4b0a12;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AW Legal CRM</h1>
          </div>
          
          <div class="content">
            <div class="notification">
              <div class="icon">${getTypeIcon(data.type)}</div>
              <div class="notification-content">
                <h2>${data.title}</h2>
                <p>${data.message}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ver en el CRM
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente por AW Legal CRM</p>
            <p>Si no deseas recibir estas notificaciones, puedes configurar tus preferencias en el sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Enviar email de recordatorio de pago
  async sendPaymentReminderEmail(
    to: string,
    caseNumber: string,
    amount: number,
    milestoneName?: string,
    dueDate?: string
  ): Promise<boolean> {
    const subject = `[AW Legal] Recordatorio de Pago - Caso ${caseNumber}`;
    
    const message = milestoneName 
      ? `Se requiere el pago de €${amount.toFixed(2)} por el hito "${milestoneName}" del caso ${caseNumber}.`
      : `Se requiere el pago de €${amount.toFixed(2)} para el caso ${caseNumber}.`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Pago</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #660913; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .amount { font-size: 24px; font-weight: bold; color: #660913; }
          .button { display: inline-block; background-color: #660913; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recordatorio de Pago</h1>
          </div>
          <div class="content">
            <h2>Caso: ${caseNumber}</h2>
            <p>${message}</p>
            <p class="amount">€${amount.toFixed(2)}</p>
            ${dueDate ? `<p><strong>Fecha límite:</strong> ${dueDate}</p>` : ''}
            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ver Detalles
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  },

  // Enviar email de hito completado
  async sendMilestoneCompletionEmail(
    to: string,
    caseNumber: string,
    milestoneName: string,
    nextMilestone?: string
  ): Promise<boolean> {
    const subject = `[AW Legal] Hito Completado - Caso ${caseNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hito Completado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .milestone { font-size: 20px; font-weight: bold; color: #10B981; }
          .button { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Hito Completado</h1>
          </div>
          <div class="content">
            <h2>Caso: ${caseNumber}</h2>
            <p>El siguiente hito ha sido completado exitosamente:</p>
            <p class="milestone">"${milestoneName}"</p>
            ${nextMilestone ? `<p><strong>Próximo hito:</strong> ${nextMilestone}</p>` : ''}
            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ver Caso
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  },

  // Enviar email de cambio de estado de caso
  async sendCaseStatusChangeEmail(
    to: string,
    caseNumber: string,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    const subject = `[AW Legal] Estado Actualizado - Caso ${caseNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Estado de Caso Actualizado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-change { font-size: 18px; font-weight: bold; color: #3B82F6; }
          .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Estado Actualizado</h1>
          </div>
          <div class="content">
            <h2>Caso: ${caseNumber}</h2>
            <p>El estado del caso ha cambiado:</p>
            <p class="status-change">${oldStatus} → ${newStatus}</p>
            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ver Caso
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }
};
