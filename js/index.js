

const d = document;

const audioBasePath = "./media/audio/";
/* const simpleKeyAudio = new Audio(`${audioBasePath}simple_key_sound_1.m4a`);
const spaceKeyAudio = new Audio(`${audioBasePath}space_key_sound_1.m4a`);
const enterKeyAudio = new Audio(`${audioBasePath}enter_key_sound_1.m4a`);
const backspaceKeyAudio = new Audio(`${audioBasePath}backspace_key_sound_1.m4a`); */



const playKeyAudio = ($key)=> {
  console.log("key", $key);
  if ($key.closest('[data-key="Space"]')) new Audio(`${audioBasePath}space_key_sound_1.m4a`).play();
  else if ($key.closest('[data-key="Enter"]')) new Audio(`${audioBasePath}enter_key_sound_1.m4a`).play();
  else if ($key.closest('[data-key="Backspace"]')) new Audio(`${audioBasePath}backspace_key_sound_1.m4a`).play();
  else new Audio(`${audioBasePath}simple_key_sound_1.m4a`).play();
  //return;
}


const write = ($key)=> {
  console.log("hahaha", $key);
  if ($key.dataset["key-name"]) {
    
  }
}



d.addEventListener('click', e => {

  if (e.target.closest(".key")) {
    const $key = e.target.closest(".key");

    playKeyAudio($key);
    write($key);

  }




})





