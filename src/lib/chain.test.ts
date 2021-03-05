import { State, Edit, ReversibleEdit, EditChain } from "./chain";

type num = "number";

class Num implements State<num> {
  x: number[];
  constructor(x: number) {
    this.x = [x];
  }
  clone() {
    return new Num(this.x[0]);
  }
}

class Add implements ReversibleEdit<num> {
  y: number;
  reversible: boolean;
  constructor(y: number) {
    this.y = y;
    this.reversible = true;
  }
  forward(st: State<num>): void {
    (st as Num).x[0] += this.y;
  }
  backward(st: State<num>): void {
    (st as Num).x[0] -= this.y;
  }
}

test.todo("New state has current");
