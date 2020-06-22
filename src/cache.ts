import avro, { ForSchemaOptions } from 'avsc'

import { Schema } from './@types'

export default class Cache {
  registryIdBySubject: { [key: string]: number }
  schemasByRegistryId: { [key: string]: Schema | any }
  forSchemaOptions?: Partial<ForSchemaOptions>

  constructor(forSchemaOptions?: Partial<ForSchemaOptions>) {
    this.registryIdBySubject = {}
    this.schemasByRegistryId = {}
    this.forSchemaOptions = forSchemaOptions
  }

  getLatestRegistryId = (subject: string): number | undefined => this.registryIdBySubject[subject]

  setLatestRegistryId = (subject: string, id: number): number => {
    this.registryIdBySubject[subject] = id

    return this.registryIdBySubject[subject]
  }

  getSchema = (registryId: number): Schema | any => this.schemasByRegistryId[registryId]

  setSchema = (registryId: number, schema: Schema | any, protobuf?: boolean) => {
    // @ts-ignore TODO: Fix typings for Schema...
    if (protobuf) {
      this.schemasByRegistryId[registryId] = schema

      console.log('this.schemasByRegistryId :', this.schemasByRegistryId)
    } else {
      this.schemasByRegistryId[registryId] = avro.Type.forSchema(schema, this.forSchemaOptions)
    }

    return this.schemasByRegistryId[registryId]
  }

  clear = (): void => {
    this.registryIdBySubject = {}
    this.schemasByRegistryId = {}
  }
}
