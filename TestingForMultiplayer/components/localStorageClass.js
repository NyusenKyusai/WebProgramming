class localStorageClass {
  jsonObject = {};

  constructor(numberOfLevels) {
    for (let i = 0; i < numberOfLevels; i++) {
      this.jsonObject["level" + (i + 1)] = {
        array: [],
        kills: 0,
      };
    }

    //console.log(this.jsonObject);

    let jsonString = JSON.stringify(this.jsonObject);
    localStorage.setItem("game", jsonString);
  }

  getJSONObject = (key) => {
    let localObject = JSON.parse(localStorage.getItem(key));

    return localObject;
  };

  setJSONObject = (object) => {
    let stringObject = JSON.stringify(object);

    localStorage.setItem("game", stringObject);
  };
}

export default localStorageClass;
