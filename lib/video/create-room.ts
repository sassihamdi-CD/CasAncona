/**
 * Video room creation for online consultations.
 *
 * Default: Jitsi Meet (free, no API key). Links like https://meet.jit.si/cas-{roomId}
 * Optional: set DAILY_API_KEY for Daily.co, or use Zoom/Google Meet via env if added later.
 */

const JITSI_BASE = "https://meet.jit.si";
const ROOM_PREFIX = "StudioCAS";

/** Safe room name: alphanumeric only (Jitsi works best without spaces/special chars). */
function toJitsiRoomName(appointmentId: string): string {
  const safe = appointmentId.replace(/-/g, "").toLowerCase();
  return `${ROOM_PREFIX}-${safe}`;
}

export interface CreateRoomResult {
  roomId: string;
  roomUrl: string;
}

export async function createVideoRoom(params: {
  appointmentId: string;
  clientName: string;
}): Promise<CreateRoomResult> {
  const { appointmentId } = params;

  // Optional: use Daily.co if you set DAILY_API_KEY (paid)
  if (process.env.DAILY_API_KEY) {
    // TODO: call Daily.co API if you prefer a paid provider
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";
    return {
      roomId: `daily-${appointmentId}`,
      roomUrl: `${base}/video/room/${appointmentId}`,
    };
  }

  // Default: Jitsi Meet — free, no API key, no account. Client and lawyer open the link in browser.
  const roomName = toJitsiRoomName(appointmentId);
  const roomUrl = `${JITSI_BASE}/${roomName}`;

  return {
    roomId: roomName,
    roomUrl,
  };
}
