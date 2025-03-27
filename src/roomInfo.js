export class RoomInfo {
  addDectectedPeople(people) {
    const detectedPeopleList = document.getElementById("dectedPeople");
    detectedPeopleList.innerHTML = "";
    people.forEach((person) => {
      const newDetectedPerson = document.createElement("li");
      newDetectedPerson.innerText = person._label;
      detectedPeopleList.appendChild(newDetectedPerson);
    });
  }
}
