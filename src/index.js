const { request } = require('graphql-request');
const fs = require('fs');

const uri = 'http://nlbavwixs.infor.com:4000';

const query = `query a{
  sev2: backlog(severityname:MAJOR, statusFilter:BACKLOG, productFilters: ["LN"]) {
    incident
    severityname
    customername
    summary
    owner
    status
    lastupdated
    dayssincelastupdate
    title
    service_restored_date
    navid
    
  }
  sev1: backlog(severityname:CRITICAL, productFilters: ["LN"]) {
    incident
    severityname
    customername
    summary
    owner
    status
    lastupdated
    dayssincelastupdate
    title
    service_restored_date
    navid
    
  }
  accounts {
    fullname
    email
    navid
  }


}`;

const mutation = `
  mutation SEND_INCIDENT_NOTIFICATION($address: String, $subject: String, $body: String) {
    sendIncidentNotification(address:$address, subject:$subject, body:$body)
  }

`;

async function start() {
  const result = await request(uri, query);

  const { sev1, sev2, accounts } = result;

  const ar = [...sev2];

  console.log('----------------------------------');
  const emailText = fs.readFileSync('./MajorImpact.html', 'utf-8');

  const nesev1s = ar
    .map(inc => ({ ...inc, flag: inc.service_restored_date === null }))
    .filter(({ incident, owner, flag }) => flag)
    .map(inc => {
      let account = accounts.find(acc => acc.navid.toString() === inc.navid.toString());
      if (!account) {
        console.log(inc.owner);
      } else return { ...inc, email: account.email || '' };
    });
  // console.log(nesev1s);
  nesev1s.map(async inc => {
    const { owner, incident, customername, status, lastupdated, dayssincelastupdate,title } = inc;
    const subject = ` Severity 2 notification for incident ${incident} - ${customername}`;

    const html = emailText
      .replace('{incident}', incident)
      .replace('{incident}', incident)
      .replace('{incident}', incident)
      .replace('{customer}', customername)
      .replace('{status}', status)
      .replace('{owner}', owner.split(' ')[0])
      .replace('{lastupdated}', dayssincelastupdate)
      .replace('{title}', title)
      .replace('{title}', title);
    const body = html;
    // console.log(body);
    const result = await request(uri, mutation, {
      address: inc.email,
      subject,
      body
    });
    console.log(result);
  });
}

start();
