import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2020";
import CreateAccountCommandJson from "../../messages/commands/create-account.schema.json";
import DeleteAccountCommandJson from "../../messages/commands/delete-account.schema.json";

const ajv = new Ajv();
addFormats(ajv);

export type CreateAccountCommand = {
  limit?: number;
};
export const validateCreateAccountCommand = ajv.compile(CreateAccountCommandJson);

export type DeleteAccountCommand = {
  accountId: string;
};
export const validateDeleteAccountCommand = ajv.compile(DeleteAccountCommandJson);
