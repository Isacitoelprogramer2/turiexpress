import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { Resend } from 'resend';

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

const DESTINATARIO = 'kerenpin23@gmail.com';
const REMITENTE = 'Turiexpress <turiexpress@entupunto.pe>';

interface ConsultaBody {
  name?: string;
  email?: string;
  phone?: string;
  consulta?: string;
}

function validarCampos(body: ConsultaBody): string | null {
  if (!body.name || !body.name.trim()) {
    return 'El nombre es obligatorio.';
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'El correo electrónico no es válido.';
  }
  if (!body.phone || !body.phone.trim()) {
    return 'El teléfono es obligatorio.';
  }
  if (!body.consulta || !body.consulta.trim()) {
    return 'La consulta no puede estar vacía.';
  }
  return null;
}

export const enviarReservaTuriexpress = functions
  .region('us-central1')
  .runWith({ secrets: [RESEND_API_KEY] })
  .https.onCall(async (data, context): Promise<{ ok: boolean; message: string }> => {
    const body = data as ConsultaBody;
    const error = validarCampos(body);
    if (error) {
      throw new functions.https.HttpsError('invalid-argument', error);
    }

    const resend = new Resend(RESEND_API_KEY.value());

    const fecha = new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Escapa caracteres especiales para que la consulta no rompa el HTML del correo
    const consultaSafe = String(body.consulta)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br />');

    try {
      const result = await resend.emails.send({
        from: REMITENTE,
        to: DESTINATARIO,
        subject: `Nueva consulta - ${body.name}`,
        html: `
          <h2>Nueva consulta recibida</h2>
          <p><strong>Nombre:</strong> ${body.name}</p>
          <p><strong>Correo:</strong> ${body.email}</p>
          <p><strong>Teléfono:</strong> ${body.phone}</p>
          <p><strong>Consulta:</strong></p>
          <blockquote style="margin:0;padding:12px 16px;border-left:3px solid #ddd;background:#f7f7f7;">
            ${consultaSafe}
          </blockquote>
          <p><strong>Fecha de recepción:</strong> ${fecha}</p>
          <hr />
          <p>Consulta generada desde turiexpress-site--balance-food-landing.web.app</p>
        `,
        reply_to: body.email,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        throw new functions.https.HttpsError(
          'internal',
          'No se pudo enviar la consulta. Inténtalo de nuevo.'
        );
      }

      return {
        ok: true,
        message: 'Tu consulta fue enviada. Te contactaremos pronto.',
      };
    } catch (err) {
      console.error('Error enviando correo:', err);
      throw new functions.https.HttpsError(
        'internal',
        'Ocurrió un error al enviar la consulta. Inténtalo más tarde.'
      );
    }
  });
