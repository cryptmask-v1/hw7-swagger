import joi from 'joi';

export const createContactSchema = joi.object({
  name: joi.string().min(3).max(20).required(),
  phoneNumber: joi.string().min(3).max(20).required(),
  email: joi.string().min(3).max(20).email(),
  isFavourite: joi.boolean().required(),
  contactType: joi
    .string()
    .valid('personal', 'home', 'work')
    .default('personal')
    .required(),
  userId: joi.string().required(),
  photo: joi.string().default('https://www.gravatar.com/avatar/?d=mp&f=y'),
});

export const updateContactSchema = joi.object({
  name: joi.string().min(3).max(20),
  phoneNumber: joi.string().min(3).max(20),
  email: joi.string().min(3).max(20).email(),
  isFavourite: joi.boolean(),
  contactType: joi
    .string()
    .valid('personal', 'home', 'work')
    .default('personal'),
  photo: joi.string(),
});
