'use strict'

const Hp = require('hemera-plugin')
const Nodemailer = require('nodemailer')

function hemeraEmail(hemera, opts, done) {
  const topic = 'mail'
  const Joi = hemera.joi
  const transporter = Nodemailer.createTransport(opts.transport)

  hemera.add(
    {
      topic,
      cmd: 'send',
      message: Joi.object()
        .keys({
          from: Joi.string().required(),
          to: Joi.string().required(),
          subject: Joi.string().required(),
          text: Joi.string().optional(),
          html: Joi.string().optional(),
          bcc: Joi.string().optional(),
          cc: Joi.string().optional()
        })
        .required()
    },
    function(req, reply) {
      transporter.sendMail(req.message, (err, info) => {
        if (err) {
          this.log.error(err, 'Could not send email!')
          return reply()
        }

        this.log.debug('Message %s sent %s', info.messageId, info.response)

        reply(null, {
          envelope: info.envelope,
          messageId: info.messageId
        })
      })
    }
  )

  done()
}

const plugin = Hp(hemeraEmail, '>=3')
plugin[Symbol.for('name')] = require('./package.json').name
plugin[Symbol.for('options')] = {
  name: require('./package.json').name,
  payloadValidator: 'hemera-joi',
  transport: {
    jsonTransport: true // for debugging
  }
}
module.exports = plugin
