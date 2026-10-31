import { saveContactMessage } from "../services/contactService.js";
import { contactFormSchema } from "../validators/contactValidator.js";

export async function submitContact(req, res) {
  try {
    const parseResult = contactFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid form input",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const messageRecord = await saveContactMessage(parseResult.data);
    res.status(201).json({
      success: true,
      message: "Thank you for contacting JanSeva Connect. Your message has been received.",
      ticketId: messageRecord.id,
      submittedAt: messageRecord.created_at,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while sending your message. Please try again later.",
    });
  }
}
