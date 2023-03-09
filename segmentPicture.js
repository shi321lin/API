/******************************
    show greeting message
 ****************************/ 
let firstName = localStorage.getItem("loggedInUser");
let greeting = document.getElementById("greeting");
greeting.innerHTML = "Welcome, " + firstName + "!";

/******************************
    show the first image
 ****************************/ 
let counter = 1;
if (window.location.href.indexOf("segment.html") > -1) {
    // Call your function here
    firstStep();
}

function firstStep() {
    $(document).ready(function () {
        $.get("./data/original/", function(data) {
            // find the names of the images we uploaded
            var regex = /href="([^"]+\.(?:jpg|jpeg|gif|png))"/g;
            var matches = data.match(regex);
            if (matches) {
                var imageFileNames = matches.map(function(match) {
                    return match.replace("href=", "").replace(/\"/g, "");
                });
                // show the first image as default
                document.getElementById('next').addEventListener('click', displayNextImage);
                const container = document.getElementById('image-container');
                const img = document.createElement('img');
                img.src = `data/original/${imageFileNames[0]}`;
                img.id = "image";
                container.appendChild(img);
                cropHelper();
            }
        });
    })
}

/******************************
    show images one by one
 *************************** */ 
function displayNextImage() {
    // same thing as above, just want to get the names of all images
    $(document).ready(function () {
        $.get("./data/original/", function(data) {
            var regex = /href="([^"]+\.(?:jpg|jpeg|gif|png))"/g;
            var matches = data.match(regex);
            if (matches) {
                var imageFileNames = matches.map(function(match) {
                    return match.replace("href=", "").replace(/\"/g, "");
                });

                // show the rest images one by one
                document.getElementById('next').addEventListener('click', displayNextImage);

                //save the previous image
                if(counter < imageFileNames.length+1) {
                    saveImage(imageFileNames[(counter-1)%imageFileNames.length]);
                } else {
                    saveImage('n_' +imageFileNames[(counter-1)%imageFileNames.length]);
                }
                
                // remove the previous image
                const container = document.getElementById('image-container');
                //saveImage(container.);
                container.innerHTML = '';

                // put a new image
                if (counter < imageFileNames.length) {
                    // add the next image
                    const img = document.createElement('img');
                    img.src = `data/original/${imageFileNames[counter]}`;
                    img.id = "image";
                    container.appendChild(img);
                    counter++;
                    //crop
                    cropHelper();

                // if all the images are cropped
                } else if (imageFileNames.length<= counter && counter < 2*imageFileNames.length){
                 
                        // add the next image
                        const img = document.createElement('img');
                        img.src = `data/original/${imageFileNames[counter%imageFileNames.length]}`;
                        img.id = "image";
                        img.onload = function() {
                            
                            const canvas = document.createElement('canvas');
                            //const canvas = document.getElementById('canvas');
                            //console.log(canvas)
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const imageDataCopy = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
                            //console.log(imageDataCopy.data.length);
                            for (let i = 0; i < imageDataCopy.data.length; i += 4) {
                              const r = imageDataCopy.data[i] + gaussianRandom(0, 50);
                              const g = imageDataCopy.data[i+1] + gaussianRandom(0, 50);
                              const b = imageDataCopy.data[i+2] + gaussianRandom(0, 50);
                          
                              imageDataCopy.data[i] = r > 255 ? 255 : (r < 0 ? 0 : r);
                              imageDataCopy.data[i+1] = g > 255 ? 255 : (g < 0 ? 0 : g);
                              imageDataCopy.data[i+2] = b > 255 ? 255 : (b < 0 ? 0 : b);
                            }
                            ctx.putImageData(imageDataCopy, 0, 0);
                            img.src = canvas.toDataURL();
                            img.onload = null;
                        
                         container.appendChild(img);
                        counter++;
                        cropHelper();
                    };
                } else if (counter ===  2*imageFileNames.length){
                    window.location.href = "thankyou.html";
                }
            }
        });
    })
  }

/******************************
    Segment the current image
 *************************** */ 

function cropHelper(){
    const i = document.querySelector('#image-container #image');
    //initialize the Jcrop plugin
    $(i).Jcrop({
        onSelect: function(c) {
            //imagePath = document.getElementById('image').src;
            imagePath = document.getElementById('image').src;
            cropImage(imagePath, c.x, c.y, c.w, c.h); //crop the image using the selected coordinates
        }
    });
}

function saveImage(name) {
    let tempLink = document.createElement('a');
    let fileName = name;
    tempLink.download = fileName;
    tempLink.href = document.getElementById('canvas').toDataURL("image/jpeg", 0.9);
    tempLink.click();
}

//crop the image and add noise to it
function cropImage(imagePath, newX, newY, newWidth, newHeight) {
    //create an image object from the path
    const originalImage = new Image();
    originalImage.src = imagePath;

    //initialize the canvas object
    const canvas = document.getElementById('canvas'); 
    const ctx = canvas.getContext('2d');

    //wait for the image to finish loading
    originalImage.addEventListener('load', function() {
        //set the canvas size to the new width and height
        canvas.width = newWidth;
        canvas.height = newHeight;
        //draw the image
        ctx.drawImage(originalImage, newX, newY, newWidth, newHeight, 0, 0, newWidth, newHeight); 
    });
}

/******************************
    Save the uploaded image
 *************************** */ 
function saveFile() {
    // Get the uploaded file from the input element
    const now = new Date();
    const currentTime = now.getTime();
    
    let picture = document.getElementById("imageFile").files[0];
    let label = document.getElementById("imageLabel").value;
    let filename = label + "_" + currentTime + "_" + picture.name;
       
    // Create a new FileReader object to read the file
    var reader = new FileReader();

    // Set the callback function for when the file is read
    reader.onload = function(e) {
        // Create a new anchor tag with a download attribute
        var link = document.createElement('a');
        link.href = e.target.result;
        link.download = filename;
        link.click();
    };
    reader.readAsDataURL(picture);
}

//helper function to generate a random number from a normal (Gaussian) distribution with a mean and standard deviation
function gaussianRandom(mean, std) {
    let u = Math.random();
    let v = Math.random();
    let x = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.round(mean + std * x);
}