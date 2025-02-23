import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER || '+18144845149';

// Add logging for initialization
console.log('Twilio Config:', {
  hasAccountSid: !!accountSid,
  hasAuthToken: !!authToken,
  fromNumber
});

if (!accountSid || !authToken) {
  console.error('Missing Twilio credentials');
}

const client = twilio(accountSid, authToken);

export async function sendEmergencySMS(
  to: string | undefined,
  userName: string,
  location: string,
  description: string,
  customMessage?: string,
  address?: string
) {
  try {
    // Validate phone number
    if (!to) {
      console.error('No phone number provided');
      return null;
    }

    // Add country code if not present
    const formattedNumber = to.startsWith('+') ? to : `+91${to}`;

    console.log('Attempting to send SMS:', {
      to: formattedNumber,
      from: fromNumber,
      userName,
      location,
      description,
      customMessage,
      address
    });

    const locationInfo = address 
      ? `Location: ${address}\nCoordinates: ${location}`
      : `Location: ${location}`;

    const defaultMessage = `EMERGENCY ALERT: Your contact ${userName} has reported an emergency.\n${locationInfo}\nDescription: ${description}`;
    const messageBody = customMessage 
      ? `${customMessage}\n\n${defaultMessage}`
      : defaultMessage;

    const message = await client.messages.create({
      body: messageBody + '\nThis is an automated message from the Emergency Response System.',
      from: fromNumber,
      to: formattedNumber
    });
    
    console.log('SMS sent successfully:', {
      messageId: message.sid,
      status: message.status,
      dateCreated: message.dateCreated,
      to: formattedNumber
    });
    
    return message.sid;
  } catch (error: any) {
    console.error('Detailed SMS error:', {
      error: error?.message,
      errorCode: error?.code,
      errorStatus: error?.status,
      moreInfo: error?.moreInfo,
      phoneNumber: to
    });
    // Return null instead of throwing to prevent crashing
    return null;
  }
} 