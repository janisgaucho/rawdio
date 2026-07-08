"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  const type = formData.get('type') as string;
  const firstname = formData.get('firstname') as string;
  const lastname = formData.get('lastname') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  const name = `${firstname || ''} ${lastname || ''}`.trim();
  
  // Champs spécifiques
  const subject = formData.get('subject') as string; // Pour le contact général
  const url = formData.get('url') as string; // Pour le bug
  const screenshot = formData.get('screenshot') as File; // Pour le bug

  // Données techniques pour les bugs
  const userAgent = formData.get('userAgent') as string;
  const screenResolution = formData.get('screenResolution') as string;
  const language = formData.get('language') as string;

  let emailSubject = '';
  let emailHtml = '';
  let attachments = [];

  // 1. Préparation de la pièce jointe (si présente)
  if (screenshot && screenshot.size > 0) {
    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    attachments.push({
      filename: screenshot.name,
      content: buffer,
    });
  }

  // 2. Formatage de l'email selon le type de formulaire
  if (type === 'general') {
    emailSubject = `[Rawdio] Prise de contact`;
    emailHtml = `<!DOCTYPE html>
    <html>
    <body style="background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; border: 1px solid #e5e5ea; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="padding: 30px 40px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1d1d1f; margin: 0 0 30px 0;">Nouvelle demande de contact</h1>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">Nom</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${name}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">Email</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${email}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">Sujet</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${subject}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5ea; margin: 30px 0;">

          <div>
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 10px 0;">Message</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #86868b; margin-top: 20px;">Envoyé depuis le formulaire de contact Rawdio</p>
    </body>
    </html>`;
  } else {
    emailSubject = `[Rawdio] Signalement bug`;
    emailHtml = `<!DOCTYPE html>
    <html>
    <body style="background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; border: 1px solid #e5e5ea; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="padding: 30px 40px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1d1d1f; margin: 0 0 30px 0;">Nouveau signalement de bug</h1>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">Nom</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${name}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">Email</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${email}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 5px 0;">URL concernée</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0;">${url || 'Non renseignée'}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5ea; margin: 30px 0;">

          <div>
            <p style="font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; margin: 0 0 10px 0;">Description du problème</p>
            <p style="font-size: 16px; color: #1d1d1f; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 30px; background-color: #1d1d1f; border-radius: 12px; padding: 20px; color: #f5f5f7; font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace; font-size: 13px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #86868b; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">Données techniques</h3>
            <div style="margin-bottom: 10px;">
              <span style="color: #86868b;">Résolution:</span>
              <span style="color: #f5f5f7; margin-left: 8px;">${screenResolution || 'N/A'}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="color: #86868b;">Langue:</span>
              <span style="color: #f5f5f7; margin-left: 8px;">${language || 'N/A'}</span>
            </div>
            <div>
              <span style="color: #86868b;">User Agent:</span>
              <span style="color: #f5f5f7; margin-left: 8px; display: block; margin-top: 4px; line-height: 1.5;">${userAgent || 'N/A'}</span>
            </div>
          </div>

        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #86868b; margin-top: 20px;">Envoyé depuis le formulaire de contact Rawdio</p>
    </body>
    </html>`;
  }

  try {
    // 3. Envoi de l'email
    const data = await resend.emails.send({
      from: 'Rawdio <onboarding@resend.dev>', // Email par défaut de Resend pour les tests
      to: 'botellajvnis@gmail.com', // Ta boîte de réception
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Une erreur est survenue lors de l\'envoi.' };
  }
}