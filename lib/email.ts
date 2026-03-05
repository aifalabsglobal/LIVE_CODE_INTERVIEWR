/**
 * Email notification service.
 * Uses Resend SDK when RESEND_API_KEY is set.
 * Falls back to console.log when no API key is configured.
 */

interface InterviewInvitationParams {
  candidateEmail: string;
  candidateName: string;
  roomId: string;
  mode: string;
  scheduledAt: Date;
  interviewerName: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getModeLabel(mode: string): string {
  switch (mode) {
    case "MEET":
      return "Meet";
    case "INTERVIEW":
      return "Live Interview";
    case "AI_MOCK":
      return "AI Mock Interview";
    default:
      return mode;
  }
}

function getModeRoute(mode: string): string {
  switch (mode) {
    case "MEET":
      return "meet";
    case "INTERVIEW":
      return "interview";
    case "AI_MOCK":
      return "ai-interview";
    default:
      return "interview";
  }
}

export async function sendInterviewInvitation(
  params: InterviewInvitationParams
): Promise<boolean> {
  const {
    candidateEmail,
    candidateName,
    roomId,
    mode,
    scheduledAt,
    interviewerName,
  } = params;

  const modeLabel = getModeLabel(mode);
  const modeRoute = getModeRoute(mode);
  const joinUrl = `${APP_URL}/${modeRoute}?roomId=${roomId}`;
  const dateStr = new Date(scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e2e8f0; padding: 32px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">📋 Interview Invitation</h1>
        <p style="color: #8b949e; font-size: 14px; margin-top: 8px;">Live Code Interviewer</p>
      </div>
      
      <p style="font-size: 16px; margin-bottom: 24px;">Hello <strong>${candidateName}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 1.6;">
        You have been invited to a <strong style="color: #137fec;">${modeLabel}</strong> session scheduled by <strong>${interviewerName}</strong>.
      </p>
      
      <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">Date & Time</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;"><strong>${dateStr}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">Mode</td>
            <td style="padding: 8px 0; color: #137fec; text-align: right;"><strong>${modeLabel}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">Room ID</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right; font-family: monospace; letter-spacing: 1px;"><strong>${roomId}</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${joinUrl}" style="background: #137fec; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
          Join Interview
        </a>
      </div>
      
      <p style="font-size: 13px; color: #8b949e; margin-top: 24px;">
        <strong>Instructions:</strong><br/>
        • Click the button above or paste the Room ID into the platform.<br/>
        • Ensure a stable internet connection and working microphone/camera.<br/>
        • Be ready 5 minutes before the scheduled time.
      </p>
      
      <hr style="border: none; border-top: 1px solid #30363d; margin: 24px 0;" />
      <p style="font-size: 11px; color: #484f58; text-align: center;">
        This email was sent by Live Code Interviewer. If you did not expect this invitation, please ignore it.
      </p>
    </div>
  `;

  // Try Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Live Code <noreply@livecode.dev>",
        to: candidateEmail,
        subject: `Interview Invitation [Room: ${roomId}]: ${modeLabel} on ${dateStr}`,
        html: htmlBody,
      });
      console.log(`[EMAIL] Sent invitation to ${candidateEmail}`);
      return true;
    } catch (err) {
      console.error("[EMAIL] Failed to send via Resend:", err);
      return false;
    }
  }

  // Fallback: log to console
  console.log("─────────── EMAIL (no RESEND_API_KEY set) ───────────");
  console.log(`To: ${candidateEmail}`);
  console.log(`Subject: Interview Invitation [Room: ${roomId}]: ${modeLabel} on ${dateStr}`);
  console.log(`Room ID: ${roomId}`);
  console.log(`Join URL: ${joinUrl}`);
  console.log("─────────────────────────────────────────────────────");
  return true;
}
