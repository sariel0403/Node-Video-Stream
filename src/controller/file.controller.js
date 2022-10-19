const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";
const Uploadedfiles = require("../../models/Uploadedfiles");
var Client = require("ftp");
var c = new Client();

c.connect({
  host: "65.108.103.246",
  port: "21",
  user: "freelancer",
  password: "6sEbmm4rj7tX2x72",
});

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    // upload file to ftp server
    console.log("original filename ----->", req.file.originalname);
    c.put(req.file.originalname, req.file.originalname, function (err) {
      if (err) throw err;
      c.end();
    });

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const newFile = new Uploadedfiles({
      filename: req.file.originalname,
      filepath:
        __basedir + "/resources/static/assets/uploads/" + req.file.originalname,
    });
    newFile.save();

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  /*
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
  */
  Uploadedfiles.find({}, function (err, files) {
    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file.filename,
        url: baseUrl + file.filename,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
  remove,
  removeSync,
};
