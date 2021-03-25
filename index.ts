import { Client } from 'discord.js'
import { promises } from 'fs'
import { OAuth2Client } from 'googleapis-common'
import { google, sheets_v4 } from 'googleapis'

import { GOOGLE, DISCORD } from './src/config'
import { getToken } from './src/gettoken'
import { ErrorMessage } from './src/util'
import { getStatus } from './src/getstatus'
import { codeToNum, sanitizePlace, sanitizeMode1, sanitizeMode2 } from './src/sanitize'
import { getCurrent } from './src/getcurrent'
import { setPlace } from './src/setplace'

const client = new Client()
let oAuth2Client: OAuth2Client
let sheets: sheets_v4.Sheets
let credentialsvalid: boolean = true

client.on('ready', () => {
  console.log('ready')
})

client.on('message', async message => {
  if (message.content.startsWith('창연아 ')) {
    const content = message.content.trim().slice(4)

    if (content.startsWith('인증')) {
      const ret = await getToken(message, oAuth2Client)
      if (ret !== undefined) sheets = ret!

      return
    }

    if (!credentialsvalid) {
      await message.channel.send(ErrorMessage('인증이 필요합니다.'))

      return
    }

    if (content.startsWith('현황')) {
      try {
        if(sanitizeMode1(content.slice(3)) === undefined) throw Error;
        await getStatus(message, sheets, sanitizeMode1(content.slice(3))!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 현황 [1|2|1교시|2교시]\`'))
      }

      return
    }

    if (content.startsWith('보기')) {
      try {
        if(codeToNum(parseInt(content.slice(3))) === undefined) throw Error;
        await getCurrent(message, sheets, codeToNum(parseInt(content.slice(3)))!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 보기 [(학번)]\`'))
      }

      return
    }

    if (content.startsWith('신청')) {
      const splitted = content.slice(3).split(' ')

      try {
        if(parseInt(splitted[0]) === undefined) throw Error;
        if(sanitizePlace(splitted[1]) === undefined) throw Error;
        if(sanitizeMode2(splitted[2]) === undefined) throw Error;
        
        await setPlace(message, sheets,
          codeToNum(parseInt(splitted[0]))!, sanitizePlace(splitted[1])!, sanitizeMode2(splitted[2])!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 신청 [(학번)] [(장소)] [1|2|3|1교시|2교시|모두]\`'))
      }
    }
  }

});

(async () => {
  const credentials = JSON.parse(
    (await promises.readFile(GOOGLE.CREDENTIAL_PATH)).toString()
  )
  const { client_secret, client_id, redirect_uris } = credentials.installed
  oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  )

  client.login(
    JSON.parse(
      (await promises.readFile(DISCORD.TOKEN_PATH)).toString()
    ).installed
  )

  try {
    oAuth2Client.setCredentials(JSON.parse((await promises.readFile(GOOGLE.TOKEN_PATH)).toString()))
    sheets = google.sheets({ version: 'v4', auth: oAuth2Client })
  } catch (e) {
    credentialsvalid = false
  }

})();