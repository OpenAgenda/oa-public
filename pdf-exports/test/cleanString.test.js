import cleanString from '../lib/cleanString.js';

function testCleanString() {
  const inputStrings = ['É', 'Â'];

  inputStrings.forEach(str => {
    const cleanedStr = cleanString(str);
    console.log('Original string characters and char codes:');
    console.log(str.length);
    for (let i = 0; i < str.length; i++) {
      console.log(str[i], str.charCodeAt(i));
    }

    console.log('Cleaned string characters and char codes:');
    console.log(cleanedStr.length);
    for (let i = 0; i < cleanedStr.length; i++) {
      console.log(cleanedStr[i], cleanedStr.charCodeAt(i));
    }
  });
}

testCleanString();
