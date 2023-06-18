const { intro, spinner, note, outro, text } = require("@clack/prompts");
const color = require("picocolors");

const s = spinner();

exports.print = (text) => {
	console.log(color.green("◇") + "  " + text);
};

exports.printIntro = () => {
	intro(color.bgCyan(color.white(" Whatsapp ChatGPT & DALL-E ")));
	note("A Whatsapp bot that uses OpenAI's ChatGPT and DALL-E to generate text and images from a prompt.");
	s.start("Starting");
};

exports.printQRCode = (qr) => {
	s.stop("Client is ready!");
	note(qr, "Scan the QR code below to login to Whatsapp Web.");
	s.start("Waiting for QR code to be scanned");
};

exports.printLoading = () => {
	s.stop("Authenticated!");
	s.start("Logging in");
};

exports.printAuthenticated = () => {
	s.stop("Session started!");
	s.start("Opening session");
};

exports.printAuthenticationFailure = () => {
	s.stop("Authentication failed!");
};

exports.printOutro = () => {
	s.stop("Loaded!");
	outro("Whatsapp ChatGPT & DALLE is ready to use.");
};
