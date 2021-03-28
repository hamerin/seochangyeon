import { Message } from "discord.js";
import { ErrorMessage } from "./util";

export async function getUser(message: Message, name: string, emailAddress: string): Promise<void> {
  try {
    await message.channel.send(
      `**${name}**(${emailAddress})로 빙의하고 있어요!`
    )
  } catch (e) {
    await message.channel.send(
      ErrorMessage()
    )
  }
}