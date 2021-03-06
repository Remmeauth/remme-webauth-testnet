import express from 'express';
import Remme from "remme";
import { certificateFromPem } from "remme-utils";
import { sha256 } from 'remme-utils';

import { nodeAddress } from "../config";
import { getCollection } from "../functions";

const remme = new Remme.Client({
  networkConfig: {
    nodeAddress
  },
});
const router = express.Router();

router.get("/", async (req, res) => {
  const backURL = req.header('Referer');

  if (!req.get('X-SSL-Client-Cert')) {
    res.redirect(`${backURL}?isOk=false&name=false&userId=false&ga=false`);
    return;
  }

  const certificate = decodeURIComponent(req.get('X-SSL-Client-Cert'));
  const cert = certificateFromPem(certificate);

  if (certificate) {
    let isValid = false;
    try {
      const check = await remme.certificate.check(certificate);
      isValid = check;
    } catch (e) {
      res.redirect(`${backURL}?isOk=false&name=false&userId=false&ga=false`);
    }
    if (isValid) {
      const session = await getCollection("session");
      const { insertedId: userId } = await session.insertOne({ certificate: certificate });

      const store = await getCollection("certificates");
      const { secret } = await store.findOne({ hashOfCertificate: sha256(certificate.replace(/\r?\n?/g, "")) });

      res.redirect(`${backURL}?isOk=true&name=${cert.subject.getField('CN').value}&userId=${userId}&ga=${!!secret}`);
    } else {
      res.redirect(`${backURL}?isOk=false&name=false&userId=false&ga=false`);
    }
  } else {
    res.redirect(`${backURL}?isOk=false&name=false&userId=false&ga=false`);
  }
});

router.delete('/', async (req, res) => {
  const { userId } = req.body;

  const session = await getCollection("session");
  await session.deleteOne({ user: userId });

  res.json({ success: true });
});

export default router;