const { request } = require("graphql-request");
const fs = require("fs");

const uri = "http://nlbavwixs.infor.com:4000";
const mutation = `
  mutation SEND_INCIDENT_NOTIFICATION($address: String, $subject: String, $body: String, $cc: String) {
    sendIncidentNotification(address:$address, subject:$subject, body:$body, cc:$cc)
  }`;

async function start() {
  const emailText = fs.readFileSync("./test.html", "utf-8");
  const [owner, title, email] = ["Joris", "Developing Extensions with LN Studio", "joris.sparla@gmail.com"];
  const subject = ` Notification ${title}`;
  const cc = "";
  const html = emailText.replace("{owner}", owner.split(" ")[0]).replace("{title}", title).replace("{title}", title);
  const body = html;
  //   console.log(body);
  const variables = {
    address: email,
    subject,
    body: "",
    cc,
  };
  console.log(variables);
  try {
    const result = await request(uri, mutation, {
      address: email,
      subject,
      body,
      cc,
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

start();
