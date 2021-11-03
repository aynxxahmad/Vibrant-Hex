//selectors

const colorDivs = document.querySelectorAll(`.color`);
const sliders = document.querySelectorAll(`.sliders`);

const adjustBtns = document.querySelectorAll(`.adjust`);
const lockBtns = document.querySelectorAll(`.lock`);

const closeSliderBtns = document.querySelectorAll(`.close-slider`);
const hexTexts = document.querySelectorAll(`.color h2`);

const generateBtn = document.querySelector(`.generate`);




//for copying functionality
const copyContainer = document.querySelector(`.copy-container`);
const copyPopup = copyContainer.children[0];

let initialColors;





//Event Listeners

document.addEventListener(`DOMContentLoaded`,initialLoad);
document.addEventListener(`DOMContentLoaded`,getLocal);

generateBtn.addEventListener(`click`,initialLoad);


sliders.forEach(slider=>{
    slider.addEventListener(`input`, hslControls);
})

colorDivs.forEach((colorDiv,index)=>{
    colorDiv.addEventListener(`change`,()=>{
        updateTextUI(index);
    })
});



adjustBtns.forEach((adjustBtn,index)=>{
    adjustBtn.addEventListener(`click`,(e)=>{
        showSlider(e,index);
    });
})

lockBtns.forEach((lockBtn,index)=>{
    lockBtn.addEventListener(`click`,(e)=>{
        lockDiv(e,index);
    });
})
closeSliderBtns.forEach((closeSliderBtn,index)=>{
    closeSliderBtn.addEventListener(`click`,(e)=>{
        closeSlider(e,index);
    });
})



hexTexts.forEach(hexText=>{
    hexText.addEventListener(`click`,()=>{
        copyHexText(hexText);
    })
})


copyPopup.addEventListener(`transitionend`,()=>{
    copyPopup.classList.remove(`active`);
    copyContainer.classList.remove(`active`);
});







//Functions

function generateRandomColor(){
    const randomColor = chroma.random();
    return randomColor;
}


function initialLoad(){
    initialColors=[];
    colorDivs.forEach(colorDiv=>{
        const color = generateRandomColor();
        const hexText = colorDiv.children[0];

        if(colorDiv.classList.contains(`locked`)){
            initialColors.push(hexText.innerText);
            return;
        }

        else{
            initialColors.push(color);
        }

        
        hexText.innerText = color;
        hexText.style.color = checkContrast(color,hexText);

        colorDiv.style.backgroundColor = color;

        const icons = colorDiv.querySelectorAll(`.controls button`);
        icons.forEach(icon=>{
            icon.style.color = checkContrast(color);
        });


        //initial colors for the sliders
        const sliders = colorDiv.querySelectorAll(`input[type="range"]`);
        const hue= sliders[0]; 
        const brightness = sliders[1]; 
        const saturation = sliders[2]; 

        colorizeSliders(color,hue,brightness,saturation)
    });
    resetInputs();
}




function checkContrast(color){
    const luminance = chroma(color).luminance();
    if(luminance<=0.4)
         return `white`;
    else    
         return `black`;
}


function colorizeSliders(color,hue,brightness,saturation){
    //for hue
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;


    //for brightness
    const midBright = color.set(`hsl.l`,0.5);
    const brightScale = chroma.scale([`black`,midBright,`white`]);
    brightness.style.backgroundImage = `linear-gradient(to right,${brightScale(0)},${brightScale(0.5)} ,${brightScale(1)})`;

    //for saturation
    const minSat = color.set(`hsl.s`,0);
    const maxSat = color.set(`hsl.s`,1);
    const satScale = chroma.scale([minSat,color,maxSat]);
    saturation.style.backgroundImage = `linear-gradient(to right,${satScale(0)},${satScale(1)})`;


}





//slider Control Functions


function hslControls(e){
    const index = e.target.getAttribute(`data-hue`) || e.target.getAttribute(`data-bright`) || e.target.getAttribute(`data-sat`);
    const sliders = e.target.parentElement.parentElement.querySelectorAll(`input[type="range"]`);
    const hue= sliders[0]; 
    const brightness = sliders[1]; 
    const saturation = sliders[2]; 

    //applying newBgColor

    const newColor = initialColors[index]
                        .set(`hsl.h`,hue.value)
                        .set(`hsl.s`,saturation.value)
                        .set(`hsl.l`,brightness.value)

    colorDivs[index].style.backgroundColor = newColor;

    colorizeSliders(newColor,hue,brightness,saturation);
}


function updateTextUI(index){

    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);

     //again checking for contrast
     const hexText = colorDivs[index].children[0];
     hexText.innerText = color;
     hexText.style.color = checkContrast(color,hexText);

     const icons = colorDivs[index].querySelectorAll(`.controls button`);
     icons.forEach(icon=>{
         icon.style.color = checkContrast(color,icon);
     });

}


function resetInputs(){
    const sliders = document.querySelectorAll(`.sliders input[type="range"]`);
    sliders.forEach(slider=>{
        if(slider.name===`hue`){
            const hueColor = initialColors[slider.getAttribute(`data-hue`)];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        else if(slider.name===`brightness`){
            const brightColor = initialColors[slider.getAttribute(`data-bright`)];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = brightValue;
        }
        else if(slider.name===`saturation`){
            const satColor = initialColors[slider.getAttribute(`data-sat`)];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = satValue;
        }
    });
}


function copyHexText(hexText){
    const tempEl = document.createElement(`textarea`);
    tempEl.value = hexText.innerText;
    document.body.appendChild(tempEl);

    tempEl.select();
    document.execCommand(`copy`);
    document.body.removeChild(tempEl);

    copyContainer.classList.add(`active`);
    copyPopup.classList.add(`active`);
    


}


function showSlider(e,index){
    const currentSlider = colorDivs[index].querySelector(`.sliders`);
    currentSlider.classList.add(`active`);
}

function closeSlider(e,index){
    const currentSlider = colorDivs[index].querySelector(`.sliders`);
    currentSlider.classList.remove(`active`);
}



function lockDiv(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  }





  //Local Storage stuff


//selectors
const saveBtn = document.querySelector(`.save`);
const saveContainer = document.querySelector(`.save-container`);
const savePopup = document.querySelector(`.save-popup`);
const closeSave = document.querySelector(`.close-save`);
const submitSaveBtn = document.querySelector(`.submit-save`);
const saveInput = document.querySelector(`.save-name`);

const libraryBtn = document.querySelector(`.library-panel button`)
const libraryCloseBtn = document.querySelector(`.close-library`)
const libraryContainer = document.querySelector(`.library-container`);


let savedPalettes=[];


//eventListeners
saveBtn.addEventListener(`click`,openSavePalette);
closeSave.addEventListener(`click`,closeSavePalette);
submitSaveBtn.addEventListener(`click`,savePalette);
libraryBtn.addEventListener(`click`,openLibrary);
libraryCloseBtn.addEventListener(`click`,closeLibrary);

//functions
function openSavePalette(e){
    saveContainer.classList.add(`active`);
    savePopup.classList.add(`active`);
}

function closeSavePalette(){
    saveContainer.classList.remove(`active`);
    savePopup.classList.remove(`active`);
}

function savePalette(){
    saveContainer.classList.remove(`active`);
    savePopup.classList.remove(`active`);

    const name = saveInput.value;
    const colors = [];

    colorDivs.forEach((colorDiv,index)=>{
       let hex = colorDiv.children[0].innerText;
        colors.push(hex);
    });


    //generating the object

    let paletteNum;
    const paletteObjects = JSON.parse(localStorage.getItem(`palettes`));

    if(paletteObjects)
        paletteNum = paletteObjects.length;
    else    
        paletteNum = savedPalettes.length;

    const paletteObj = {
        paletteName : name,
        colors : colors,
        number : paletteNum
    }

    savedPalettes.push(paletteObj);

    //saving to local Storage
    saveToLocal(paletteObj);
    saveInput.value="";

    //Generating the palette for library
    const palette = document.createElement(`div`);
    palette.classList.add(`custom-palette`);
    const paletteTitle = document.createElement(`h4`);
    paletteTitle.innerText = paletteObj.paletteName;
    const preview = document.createElement(`div`);
    preview.classList.add(`color-preview`);

    paletteObj.colors.forEach(color=>{
        const smallDiv = document.createElement(`div`);
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement(`button`);
    paletteBtn.classList.add(`palette-btn`); 
    paletteBtn.classList.add(paletteObj.number);
    paletteBtn.innerText = "Select";




    paletteBtn.addEventListener(`click`,(e)=>{
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors=[];
        savedPalettes[paletteIndex].colors.forEach((color,index)=>{
                initialColors.push(color);
                console.log(color);
                colorDivs[index].style.backgroundColor = color;
                const text = colorDivs[index].children[0];
                text.innerText = color;
                text.style.color = checkContrast(color,text);

                const icons = colorDivs[index].querySelectorAll(`.controls button`);
                icons.forEach(icon=>{
                    icon.style.color = checkContrast(color);
                });

                updateTextUI(index)
        });
        resetInputs();
    });

    //Appending to the library
    palette.appendChild(paletteTitle);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

    

}




function saveToLocal(paletteObj){
    let localPalettes;
    //checking if i have something in the local storage or not
    if(localStorage.getItem(`palettes`)==null)
        localPalettes=[];
    else
        localPalettes = JSON.parse(localStorage.getItem(`palettes`));
    localPalettes.push(paletteObj);
    localStorage.setItem(`palettes`,JSON.stringify(localPalettes));

}


function openLibrary(e){
    libraryContainer.classList.add(`active`);
    libraryContainer.children[0].classList.add(`active`);

}

function closeLibrary(e){
    libraryContainer.classList.remove(`active`);
    libraryContainer.children[0].classList.remove(`active`);
}


function getLocal(){
    //check
    let localPalettes;
    if(localStorage.getItem(`palettes`)==null)
        localPalettes = [];
    else
        paletteObjects= JSON.parse(localStorage.getItem(`palettes`));


        savedPalettes=[...paletteObjects];
        
        paletteObjects.forEach(paletteObj=>{
            const palette = document.createElement(`div`);
            palette.classList.add(`custom-palette`);
            const paletteTitle = document.createElement(`h4`);
            paletteTitle.innerText = paletteObj.paletteName;
            const preview = document.createElement(`div`);
            preview.classList.add(`color-preview`);
        
            paletteObj.colors.forEach(color=>{
                const smallDiv = document.createElement(`div`);
                smallDiv.style.backgroundColor = color;
                preview.appendChild(smallDiv);
            });
        
            const paletteBtn = document.createElement(`button`);
            paletteBtn.classList.add(`palette-btn`); 
            paletteBtn.classList.add(paletteObj.number);
            paletteBtn.innerText = "Select";
        
        
        
        
            paletteBtn.addEventListener(`click`,(e)=>{
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors=[];
                paletteObjects[paletteIndex].colors.forEach((color,index)=>{
                        initialColors.push(color);
                        console.log(color);
                        colorDivs[index].style.backgroundColor = color;
                        const text = colorDivs[index].children[0];
                        text.innerText = color;
                        text.style.color = checkContrast(color,text);
        
                        const icons = colorDivs[index].querySelectorAll(`.controls button`);
                        icons.forEach(icon=>{
                            icon.style.color = checkContrast(color);
                        });
        
                        updateTextUI(index);
                });
                resetInputs();
            });
        
            //Appending to the library
            palette.appendChild(paletteTitle);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
}

