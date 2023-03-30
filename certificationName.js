const mongoose = require('mongoose');

const certificationNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const CertificationName = mongoose.model('CertificationName', certificationNameSchema);

module.exports = CertificationName;
