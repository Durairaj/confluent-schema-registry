import { Schema } from './@types'
// import * as protobuf from 'protobufjs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Protobuf = require('protobufjs')

const DEFAULT_OFFSET = 0

// Based on https://github.com/mtth/avsc/issues/140
const collectInvalidPaths = (schema: Schema, jsonPayload: object) => {
  const paths: any = []
  schema.isValid(jsonPayload, {
    errorHook: path => paths.push(path),
  })

  return paths
}

export const MAGIC_BYTE = Buffer.alloc(1)

export const encode = async (schema: Schema | any, registryId: number, jsonPayload: any) => {
  let avroPayload
  if (schema.namespace) {
    try {
      avroPayload = schema.toBuffer(jsonPayload)
    } catch (error) {
      error.paths = collectInvalidPaths(schema, jsonPayload)
      throw error
    }
  } else {
    const root = Protobuf.parse(schema, { keepCase: true }).root

    console.log('root :', root)

    console.log('json payload :', jsonPayload)
    const messageType = root.lookupType('MyRecord')
    const errMsg = messageType.verify(jsonPayload)
    console.log('sehcma verify :', messageType.verify(jsonPayload))
    if (errMsg) {
      console.error(errMsg)
      throw Error(errMsg)
    }
    const msg = await messageType.encode(jsonPayload).finish()
    avroPayload = msg
    console.log('buf', msg)
  }
  const registryIdBuffer = Buffer.alloc(4)
  registryIdBuffer.writeInt32BE(registryId, DEFAULT_OFFSET)
  return Buffer.concat([MAGIC_BYTE, registryIdBuffer, avroPayload])
}
