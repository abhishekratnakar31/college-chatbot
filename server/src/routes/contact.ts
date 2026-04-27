import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function contactRoute(app: FastifyInstance, options: FastifyPluginOptions) {
  app.post("/contact", async (request, reply) => {
    console.log("DEBUG: Hit /contact endpoint");
    const { name, email, message } = request.body as { name: string, email: string, message: string };

    if (!name || !email || !message) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    // LOGGING THE MESSAGE (SIMULATING EMAIL SENDING)
    console.log("-----------------------------------------");
    console.log("NEW SUPPORT REQUEST RECEIVED");
    console.log(`FROM: ${name} (${email})`);
    console.log(`MESSAGE: ${message}`);
    console.log("-----------------------------------------");

    // IN A PRODUCTION ENVIRONMENT:
    // You would use nodemailer or a service like Resend/SendGrid here.
    // Example:
    // await resend.emails.send({ from: 'support@academiaai.edu', to: '[EMAIL_ADDRESS]', subject: 'New Support Request', text: message });

    return reply.status(200).send({ success: true, message: "Message received" });
  });
}
