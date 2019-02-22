class Column {
  constructor(floorNumber, elevatorNumber) {
    this.floorNumber = floorNumber;
    this.elevatorNumber = elevatorNumber;
    this.callButtons = [];
    this.elevators = [];
    // On crée tout les boutons d'appels "UP" et "DOWN" en fonction du nombre d'étages
    this.callButtonsCreation();
    // On crée tout les elevators qui ont été demandé en fonction de "elevatorNumber"
    this.elevatorCreate();
  }

  // On crée le nombre d'elevators demandé, qu'on ajoute au tableau "elevators"
  elevatorCreate() {
    for (let i = 0; i < this.elevatorNumber; i++) {
      // On crée les ascenceurs qu'on place au premier étage
      let elevator = new Elevator(1, this.floorNumber);
      this.elevators.push(elevator);
    }
  }

  // En fonction du nombre d'étages, on crée des boutons d'appel, qu'on ajoute au tableau "callButtons"
  callButtonsCreation() {
    for (let i = 0; i < this.floorNumber; i++) {
      // Si i est le dernier étage, alors on ne met pas de bouton UP
      if (i != this.floorNumber - 1) {
        // On créer un bouton d'appel "UP" qu'on rajoute au tableaux de boutons d'appels
        this.callButtons.push(new callButton(i + 1, "up"));
      }
      // Si i est le rez-de-chaussée (0) on ne met pas de bouton DOWN
      if (i != 0) {
        // On créer un bouton d'appel "DOWN" qu'on rajoute au tableaux de boutons d'appels
        this.callButtons.push(new callButton(i + 1, "down"));
      }
    }
  }

  // Trouver l'ascenceur le plus proche de l'étage appelé
  nearestElevator(calledfloor) {
    let differences = [];

    // Pour chaque elevateur
    for (let i = 0; i < this.elevators.length; i++) {
      // Calcul de la différence entre l'étage de l'élévateur et l'étage appelé
      differences[i] = Math.abs(this.elevators[i].floor - calledfloor);
    }

    // Pour chaque difference calculée
    for (let j = 0; j < differences.length; j++) {
      // Si la valeur la différence la plus petite est la différence entre l'étage de l'elevateur actuel et l'étage appelé
      if (
        Math.min.apply(null, differences) ===
        Math.abs(this.elevators[j].floor - calledfloor)
      ) {
        // Alors on choisit cette elevateur
        return this.elevators[j];
      }
    }
  }

  findElevator(calledfloor, direction) {
    // Pour chaque ascenceur
    for (let i = 0; i < this.elevators.length; i++) {
      // Si l'étage de l'ascenceur est le même que celui où on l'appel et qu'il est en "available"
      if (
        this.elevators[i].floor === calledfloor &&
        this.elevators[i].status === "available"
      ) {
        // La direction de cette ascenceur est celle du bouton appuyé
        this.elevators[i].direction = direction;
        // Cette ascenceur va répondre à la requête
        return this.elevators[i];
      }
      // Sinon si l'élevateur est en status "available"
      else if (this.elevators[i].status === "available") {
        // On recherche l'élevateur le plus proche
        let nearestElevator = this.nearestElevator(calledfloor);
        // On passe l'elevateur le plus proche en status "unavailable"
        nearestElevator.status = "unavailable";
        // Si l'étage de l'elevateur le plus proche est plus grand que celui appelé
        if (nearestElevator.floor > calledfloor) {
          // Sa déstination devient down
          nearestElevator.direction = "down";
        }
        // Si l'étage de l'elevateur le plus proche est plus petit que celui appelé
        else if (nearestElevator.floor < calledfloor) {
          // Sa déstination devient up
          nearestElevator.direction = "up";
        }
        // Sinon on prend la direction demandé
        else {
          nearestElevator.direction = direction;
        }

        return nearestElevator;
      }
      // Si l'elevateur est en status "unavailable" et que la direction est la même que celle demandé
      else if (
        this.elevators[i].status === "unavailable" &&
        this.elevators[i].direction === direction
      ) {
        // Si la direction est up et que son étage est plus petit que l'étage appelé
        if (
          this.elevators[i].direction === "up" &&
          this.elevators[i].floor < calledfloor
        ) {
          // On choisit cet
          return this.elevators[i];
        }
        // Sinon si sa direction est down et que l'étage de l'elevateur est plus grand que l'étage appelé
        else if (
          this.elevators[i].direction === "down" &&
          this.elevators[i].floor > calledfloor
        ) {
          // On choisit cet ascenceur
          return this.elevators[i];
        }
      }
      // Sinon, on réessaye d'en trouver un
      this.findElevator(calledfloor, direction);
    }
  }

  // Si on se trouve au dixième étage et qu'on appuie sur le bouton "DOWN"
  // On demande qu'un elevateur viennent où on est (exemple 10ème etage), UP ou DOWN est juste pour optimiser
  RequestElevator(calledfloor, direction) {
    // On affiche que l'ascenceur a été demandé à l'étage en question
    console.log(
      "Elevator requested at the floor " +
        calledfloor +
        " with " +
        direction +
        " option."
    );
    // On recherche l'elevateur qui doit répondre à la demande
    let elevator = this.findElevator(calledfloor, direction);
    console.log("Elevator selected at floor " + elevator.floor);

    // On rajoute l'étage appelé à la liste des étages en attente et on trie les étages en attente pour optimiser le trajet
    elevator.floorAwaiting(calledfloor);
    // L'elevator se déplace
    elevator.elevatorMoves();

    return elevator;
  }
}

class Elevator {
  constructor(floor, floorNumber) {
    this.status = "available"; // Un elevateur est en available lors de sa création
    this.floor = floor;
    this.direction = "none"; // Un elevateur n'a pas de direction lors de sa création
    this.floorNumber = floorNumber;
    this.floorRequestButtons = [];
    this.floorList = [];
    this.unavailableList = [];
    this.door = "closed";

    // Si j'ai 10 étages, je crée 10 boutons dans chaque ascenceur pour pouvoir voyager entre les différents étages
    for (let i = 0; i < this.floorNumber; i++) {
      // +1 car on veut que les boutons aillent de 1 à 10
      this.floorRequestButtons.push(new floorRequestButton(i + 1));
    }
  }

  elevatorUp() {
    while (
      this.floor < Math.min.apply(null, this.unavailableList) &&
      this.floor < Math.min.apply(null, this.floorList)
    ) {
      this.floor++;
      console.log("Elevator going up, at floor:  " + this.floor);
    }
  }

  elevatorDown() {
    while (
      this.floor > Math.max.apply(null, this.floorList) &&
      this.floor > Math.max.apply(null, this.unavailableList)
    ) {
      this.floor--;
      console.log("Elevator going down, at floor:  " + this.floor);
    }
  }

  floorAwaiting(calledfloor) {
    if (this.status === "unavailable") {
      // On rajoute l'étage demandé à la liste "de unavailable" zuq171
      this.unavailableList.push(calledfloor);
      // Trie la liste des étages en attente
      this.unavailableList.sort(this.sortFloorLists);
    }
    // S'il est en available, on ne fait rien
    else if (this.status === "available") {
    }
  }

  sortFloorLists(a, b) {
    // Trie les nombres d'un tableau
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/sort
    // Si le premier nombre - le deuxième donne un resultat en-dessous de 0 : On ne bouge rien
    // Si égale à 0 - On bouge rien
    // Si + grand que 0 - On échange les deux nombres de place
    return a - b;
  }

  elevatorMoves() {
    // Tant qu'il reste des étages en attente, on continue
    while (this.floorList.length > 0) {
      // Si la detination est down
      if (this.direction === "down") {
        // On descend l'elevateur
        this.elevatorDown(this);
        // Supprime le dernier étage en attente de la liste
        this.floorList.pop();
      }
      // Si la direction est up
      else if (this.direction === "up") {
        // On descend l'elevateur
        this.elevatorUp(this);
        // Supprime le premier étage en attente de la liste
        this.floorList.shift();
      }
      // Procedure d'arrivage de l'elevateur
      this.elevatorArrival();
    }
    // Tant qu'il reste des unavailable, même principe qu'avant
    while (this.unavailableList.length > 0) {
      if (this.direction === "down") {
        this.elevatorDown(this);
        this.unavailableList.pop();
      } else if (this.direction === "up") {
        this.elevatorUp(this);
        this.unavailableList.shift();
      }
      this.elevatorArrival();
    }

    // Une fois la procédure d'arrivage est faîtes, on repasse en status + réinitialise la direction
    this.status = "available";
    this.direction = "none";
  }

  ElevatorStop() {
    // L'elevateur se stop
    this.status = "stopped";
  }

  OpenDoor() {
    // Portes s'ouvrent
    this.door = "opened";
  }

  CloseDoor() {
    // Tant que les protes sont obstruées, on ouvre la porte
    while (this.door === "obstructed") {
      this.OpenDoor();
    }
    // Lorsqu'elles ne sont plus obstruées, on tente de fermer
    this.door = "closed";
  }

  // Quand il arrive à sa desination
  elevatorArrival() {
    // L'elevator se stop
    this.ElevatorStop();
    console.log("Elevator stopped at floor " + this.floor);
    // Les portes s'ouvrent
    this.OpenDoor();
    console.log("Doors are " + this.door);
    // Les portes se ferment
    this.CloseDoor();
    console.log("Doors are " + this.door);
    console.log("Elevator ready");
  }

  RequestFloor(requestedfloor) {
    // Le status passe en unavailable
    this.status = "unavailable";
    // Si l'étage demandé est plus grand que l'étage actuel de l'élévateur
    if (requestedfloor > this.floor) {
      this.direction = "up";
    }
    // Si l'inverse
    else if (requestedfloor < this.floor) {
      this.direction = "down";
    }

    // Si up et que l'étage demandé est plus grand que l'actuelle, on ajoute l'étage à ceux en attente
    if (this.direction === "up" && requestedfloor > this.floor) {
      this.floorList.push(requestedfloor);
    }
    // Si down  et que l'étage demandé est plus petit que l'actuelle, on ajoute l'étage à ceux en attente
    else if (this.direction === "down" && requestedfloor < this.floor) {
      this.floorList.push(requestedfloor);
    }
    // L'elevateur se déplace
    this.elevatorMoves();
  }
}

class callButton {
  constructor(floor, direction) {
    this.floor = floor;
    this.direction = direction;
  }
}

class floorRequestButton {
  constructor(floor) {
    this.floor = floor;
  }
}

// Début d'utilisation du programme:

// Création de tout, colonne, ascenceurs, bouton d'appels DOWN et UP, bouton de requete placé dans l'ascenceurs
column = new Column(10, 2);

let currentElevator;
// Appuyer sur le bouton d'appel à un certain étage
// Gestion de l'appel d'un elevateur qui sera selectionné par le controlleur jusqu'à son arrivée
currentElevator = column.RequestElevator(5, "up");
// Une fois dans l'ascenceur appuyé sur le bouton de l'étage où on veut aller
currentElevator.RequestFloor(9);

currentElevator = column.RequestElevator(4, "down");
currentElevator.RequestFloor(1);
