const vision = require('@google-cloud/vision');
const fs = require('fs');
const PImage = require('pureimage');
const { createCanvas, loadImage } = require('canvas');
// Creates a client
const client = new vision.ImageAnnotatorClient();
module.exports = {
  extract_faces: main,
  detectFaces
};

async function _detectFaces(inputFile) {
  // Make a call to the Vision API to detect the faces
  const request = { image: { source: { filename: inputFile } } };
  const results = await client.faceDetection(request);
  const faces = results[0].faceAnnotations;
  const numFaces = faces.length;
  return faces;
}

const getFileType = (str) => '.' + str.split('.').pop();

const getImageFromInput = (inputFile) => {
  const stream = fs.createReadStream(inputFile);
  let promise;
  if (inputFile.match(/\.jpg$/)||inputFile.match(/\.jpeg$/)) {
    try {
      promise = PImage.decodeJPEGFromStream(stream);
    } catch (e) {}
  } else if (inputFile.match(/\.png$/)) {
    promise = PImage.decodePNGFromStream(stream);
  } else {
    throw new Error(`Unknown filename extension ${inputFile}`);
  }
  return promise;
};

async function highlightFaces(inputFile, faces, outputFile, PImage) {
  const img = await getImageFromInput(inputFile);
  const context = img.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0);
  // Now draw boxes around all the faces
  context.strokeStyle = 'rgba(0,255,0,0.8)';
  context.lineWidth = '1';
  faces.forEach((face) => {
    context.beginPath();
    let origX = 0;
    let origY = 0;
    face.boundingPoly.vertices.forEach((bounds, i) => {
      if (i === 0) {
        origX = bounds.x;
        origY = bounds.y;
        context.moveTo(bounds.x, bounds.y);
      } else {
        context.lineTo(bounds.x, bounds.y);
      }
    });
    context.lineTo(origX, origY);
    context.stroke();
  });
  // Write the result to a file
  const writeStream = fs.createWriteStream(outputFile);
  await PImage.encodePNGToStream(img, writeStream);
}

async function detectFaces(inputFile, outPath, hightlight = true) {
  const outputFile = outPath + Math.random() + getFileType(inputFile);
  const faces = await _detectFaces(inputFile);
  console.log("hightlighting...")
  if (hightlight) {
    try {
      await highlightFaces(inputFile, faces, outputFile, PImage);
    } catch (err) {
      console.log(err);
    }
  }
  return { faces, hightLightFace: outputFile };
}

///////////////
async function splitTo2Image(inputFile, path) {
  const outputFile1 = path + Math.random() + getFileType(inputFile);
  const outputFile2 = path + Math.random() + getFileType(inputFile);
  const img = await getImageFromInput(inputFile);
  let canvas = new createCanvas(img.width / 2, img.height);
  let context = canvas.getContext('2d');
  let image = await loadImage(inputFile);
  context.drawImage(image, 0, 0, img.width / 2, img.height, 0, 0, img.width / 2, img.height);
  let buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(outputFile1, buffer);

  let canvas2 = new createCanvas(img.width / 2, img.height);
  let context2 = canvas2.getContext('2d');
  image = await loadImage(inputFile);
  context2.drawImage(image, img.width / 2, 0, img.width / 2, img.height, 0, 0, img.width / 2, img.height);
  buffer = canvas2.toBuffer('image/jpeg');
  fs.writeFileSync(outputFile2, buffer);
  return [outputFile1, outputFile2];
}

async function extract_faces(inputFile, path) {
  //google support extract only 10faces
  console.log("detecting face");
  const { faces } = await detectFaces(inputFile);
  console.log("detected face");
  console.log(faces);
  let links = [];
  const promise = [];
  for (let cnt = 0; cnt < faces.length; cnt++) {
    const face = faces[cnt];
    let xFaces = [];
    let yFaces = [];
    face.boundingPoly.vertices.forEach((bounds, i) => {
      xFaces.push(bounds.x);
      yFaces.push(bounds.y);
    });
    let x = xFaces[0];
    let y = yFaces[0];
    let width = Math.abs(xFaces[1] - x);
    let height = Math.abs(yFaces[2] - y);
    let canvas = new createCanvas(width, height);
    let context = canvas.getContext('2d');
    let outputFile = path + Math.random() + getFileType(inputFile);
    links.push(outputFile);
    loadImage(inputFile).then((image) => {
      context.drawImage(image, x, y, width, height, 0, 0, width, height);
      const buffer = canvas.toBuffer('image/jpeg');
      fs.writeFileSync(outputFile, buffer);
    });
  }
  console.log("extract completed")
  return links;
}
async function extractManyPeople(inputFile, path) {
  // extract when > 10 people
  const { faces } = await detectFaces(inputFile, path, false);
  if (faces.length == 10) {
    let arr = await splitTo2Image(inputFile, path);
    // let left = await superExtract(arr[0]);  //đệ quy
    // let right = await superExtract(arr[1]);
    let left = await extract_faces(arr[0], path); // cắt đôi just 1 lần
    let right = await extract_faces(arr[1], path);
    return left.concat(right);
  } else {
    return await extract_faces(inputFile, path);
  }
}

async function main(fileInput, path_out) {
  const list_face_url = await extractManyPeople(fileInput, path_out);
  const { faces, hightLightFace } = await detectFaces(fileInput, path_out);
  return { faces, hightLightFace, list_face_url };
}

//test
//main('./image/test2.jpg', './image/').then((arr) => console.log(arr.faces.length, arr.list_face_url, arr.hightLightFace));
