import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { Resend } from 'resend';

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

const DESTINATARIO = 'kerenpin23@gmail.com';
const REMITENTE = 'Turiexpress <turiexpress@entupunto.pe>';

interface ReservaBody {
  name?: string;
  email?: string;
  phone?: string;
  tour?: string;
}

const TOUR_NAMES: Record<string, string> = {
  rio: '🌊 Paseo por el Río Piura',
  catacaos: '🎨 Tour nocturno en Catacaos',
  gastro: '🍽 Ruta gastronómica',
  glamping: '🏜 Glamping en Sechura',
};

function validarCampos(body: ReservaBody): string | null {
  if (!body.name || !body.name.trim()) {
    return 'El nombre es obligatorio.';
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'El correo electrónico no es válido.';
  }
  if (!body.phone || !body.phone.trim()) {
    return 'El teléfono es obligatorio.';
  }
  if (!body.tour || !TOUR_NAMES[body.tour]) {
    return 'Debes seleccionar un tour válido.';
  }
  return null;
}

export const enviarReserva = functions
  .runWith({ secrets: [RESEND_API_KEY] })
  .https.onCall(async (data, context): Promise<{ ok: boolean; message: string }> => {
    const body = data as ReservaBody;
    const error = validarCampos(body);
    if (error) {
      throw new functions.https.HttpsError('invalid-argument', error);
    }

    const resend = new Resend(RESEND_API_KEY.value());

    const tourNombre = TOUR_NAMES[body.tour as string];
    const fecha = new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    try {
      const result = await resend.emails.send({
        from: REMITENTE,
        to: DESTINATARIO,
        subject: `Nueva reserva - ${tourNombre}`,
        html: `
          <h2>Nueva reserva recibida</h2>
          <p><strong>Tour:</strong> ${tourNombre}</p>
          <p><strong>Nombre:</strong> ${body.name}</p>
          <p><strong>Correo:</strong> ${body.email}</p>
          <p><strong>Teléfono:</strong> ${body.phone}</p>
          <p><strong>Fecha de recepción:</strong> ${fecha}</p>
          <hr />
          <p>Reserva generada desde turiexpress-site--balance-food-landing.web.app</p>
        `,
        reply_to: body.email,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        throw new functions.https.HttpsError(
          'internal',
          'No se pudo enviar la reserva. Inténtalo de nuevo.'
        );
      }

      return {
        ok: true,
        message: 'Tu reserva fue enviada. Te contactaremos pronto.',
      };
    } catch (err) {
      console.error('Error enviando correo:', err);
      throw new functions.https.HttpsError(
        'internal',
        'Ocurrió un error al enviar la reserva. Inténtalo más tarde.'
      );
    }
  });
