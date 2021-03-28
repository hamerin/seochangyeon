import { MessageEmbed } from 'discord.js'
import { Credentials } from 'google-auth-library'

export const ErrorMessage = (message?: string): MessageEmbed => {
  return new MessageEmbed({
    title: "오류가 발생했습니다.",
    color: 0xff0000,
    description: message
  })
}

export type googleTokenType = {
  installed: Credentials
  info: {
    name?: string,
    emailAddress?: string
  }
}