const { request } = require('graphql-request');

const uri = 'http://nlbavwixs.infor.com:4000';

const query = `query a{
  sev2: backlog(severityname:MAJOR, statusFilter:BACKLOG, productFilters: ["LN"]) {
    incident
    severityname
    customername
    summary
    owner
    status
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
  // console.log(
  //   ar
  //     .map(inc => ({ ...inc, flag: inc.service_restored_date === null }))
  //     .filter(({ incident, owner, flag }) => flag)
  // );
  // // console.log(sev1);
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
    const subject = ` Severity 2 notification for incident ${inc.incident} - ${inc.customername}`;
    const body = `

<p><span>Good morning , ${inc.owner.split(' ')[0]}!</span></p>
<p><span>You are receiving this email because you have a Severity 2 Incident on your name:</span></p>
<p><span>&nbsp;</span></p>
<p><span>Incident ${inc.incident} customer ${inc.customername}</span></p>
<p><span>&nbsp;</span></p>
<p><span>Please, note Severity 2 incidents are reserved for issues where a critical business process is impaired and there is no workaround. Our commitment to customers is to update Severity 2 incidents daily (customer should do the same) and we are aiming to resolve them within 5 days or less. </span></p>
<p><span>We would like to ask you to follow the next steps for this incident:</span></p>
<p><span>&nbsp;</span></p>
<p><strong><span style="background: yellow;">1<sup>st</sup> Step &ndash; Check Severity level is correct.</span></strong></p>
<ul style="list-style-type: disc;">
    <li><strong><em><span>Severity 2 Definition:</span></em></strong></li>
</ul>
<p class="paragraph"><span class="normaltextrun"><strong><span style="text-decoration: underline;">Infrastructure</span></strong></span><span class="eop">&nbsp;</span></p>
<p class="paragraph"><span class="normaltextrun">Non-production system is unavailable.</span><span class="eop">&nbsp;</span></p>
<p class="paragraph"><span class="normaltextrun">Production system is unavailable for a substantial number of users.</span><span class="eop">&nbsp;</span></p>
<p class="paragraph"><span class="normaltextrun"><strong><span style="text-decoration: underline;">Application</span></strong></span><span class="eop">&nbsp;</span></p>
<p class="paragraph"><span class="normaltextrun">Defined critical business process is impaired, causing serious disruption to operations. Major business process in production system is halted, and no acceptable workaround exists.</span><span class="eop">&nbsp;</span></p>
<p class="paragraph"><span class="eop" style="font-family: Arial, sans-serif;">&nbsp;</span></p>
<p>*<strong><em>Awaiting Development</em></strong> = Development has been instructed to <strong>work on Severity 3 as per the new definitions</strong> implemented in March. So there is no need to change to Sev.2 when transferring to Development.</p>
<p><span>&nbsp;</span></p>
<p><span>&nbsp;</span></p>
<p><strong><span style="background: yellow;">2<sup>nd</sup> Step &ndash; If it is a true Severity 2 - Is Service Restored? Make sure you complete the Service Restore Date.</span></strong></p>
<p class="InforNormalBodyText"><span class="normaltextrun"><strong><span style="color: windowtext; font-family: Calibri, sans-serif;">Service Restored Time</span></strong></span><span class="normaltextrun" style="color: windowtext; font-family: Calibri, sans-serif;"> = &nbsp;we have restore the service, this means the customer has a workaround or a solution to the reported issue. </span></p>
<p><span>&nbsp;</span></p>
<p><span>In case of questions or when you see you will not be able to fill our commitments, please contact your Manager.</span></p>
`;
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
