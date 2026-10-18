import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';
    const projet = formData.get('projet')?.toString().trim() || 'Inconnu'; 
    const note = formData.get('note')?.toString().trim() || '5';
    const honeypot = formData.get('bot-field')?.toString().trim() || '';

    // Anti-spam
    if (honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!name || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nom et message requis.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['flavienkiema1@gmail.com'],
      replyTo: email || undefined,
      subject: `Nouvel avis sur le projet ${projet} - de ${name}`,
      html: `
        <h2>Nouvel avis reçu sur ton portfolio</h2>
        <p><strong>Projet :</strong> ${projet}</p>
        <p><strong>Note :</strong> ${note} / 5 ⭐</p>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email || 'non fourni'}</p>
        <p><strong>Message :</strong></p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;margin-left:0;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>
        <hr>
        <p style="color:#888;font-size:12px;">
          Reçu le ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ouagadougou' })}
        </p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur d'envoi de l'email." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};