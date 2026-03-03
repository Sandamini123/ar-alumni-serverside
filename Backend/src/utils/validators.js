const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[0-9]/, "number")
  .pattern(/[^A-Za-z0-9]/, "special")
  .required();

const emailSchema = Joi.string().email().max(255).required();

const urlSchema = Joi.string().uri({ scheme: ["http", "https"] }).max(500);

module.exports = {
  schemas: {
    register: Joi.object({
      email: emailSchema,
      password: passwordSchema
    }),
    login: Joi.object({
      email: emailSchema,
      password: Joi.string().required()
    }),
    verifyToken: Joi.object({
      token: Joi.string().min(20).required()
    }),
    forgot: Joi.object({
      email: emailSchema
    }),
    reset: Joi.object({
      token: Joi.string().min(20).required(),
      newPassword: passwordSchema
    }),
    profileUpsert: Joi.object({
      fullName: Joi.string().min(2).max(200).required(),
      bio: Joi.string().allow("").max(2000),
      linkedinUrl: urlSchema.allow(null, "")
    }),
    degree: Joi.object({
      title: Joi.string().min(2).max(255).required(),
      universityUrl: urlSchema.required(),
      completionDate: Joi.date().required()
    }),
    cert: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      courseUrl: urlSchema.required(),
      completionDate: Joi.date().required()
    }),
    licence: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      awardingBodyUrl: urlSchema.required(),
      completionDate: Joi.date().required()
    }),
    shortCourse: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      courseUrl: urlSchema.required(),
      completionDate: Joi.date().required()
    }),
    employment: Joi.object({
      company: Joi.string().min(2).max(255).required(),
      roleTitle: Joi.string().min(2).max(255).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().allow(null)
    }),
    bid: Joi.object({
      bidAmount: Joi.number().positive().precision(2).required()
    }),
    createClientToken: Joi.object({
      name: Joi.string().min(2).max(255).required()
    })
  }
};