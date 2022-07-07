import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
import { ask } from "@reach-sh/stdlib";

if (
  process.argv.length < 3 ||
  ["seller", "buyer"].includes(process.argv[2]) == false
) {
  console.log("Usage: reach run index [seller|buyer]");
  process.exit(0);
}
const role = process.argv[2];
console.log(`Your role is ${role}`);
const stdlib = loadStdlib(process.env);
console.log(`The consensus network is ${stdlib.connector}.`);
const toAU = (su) => stdlib.parseCurrency(su);
const iBalance = toAU(100);

const acc = await stdlib.newTestAccount(iBalance);
let ctc = null;

console.log('your address is', acc.getAddress())
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

interact.reportAddressMissmatch =()=> console.log("The buyer address is not correct, canceling swap");
interact.reportAcceptSwap =()=> console.log(`${ role == "seller" ? "Bob" : "the seller"} accepted the swap`);
interact.reportDeclineSwap=()=> console.log(`${ role == "seller" ? "Bob" : "the seller"} declined the swap`);
interact.confirmSwap = async (amount)=> await ask.ask(
    `${ role == "seller" ? "bob" : "the seller"} is propousing to swap ${fmt(amount)}, do you accept ?`,
    ask.yesno
  );


  if (role === "seller") {
    
   const amt = await ask.ask(
    `How much do you want to swap?`,
    stdlib.parseCurrency
  );
   interact.swapAmount = amt;
 
   interact.getBuyerAddress=async() => await ask.ask(
        `Please paste bob address`,
        address=>address
      );
        ctc = acc.contract(backend);
        ctc.getInfo().then((info) => {
            console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
         
} else {
    const address = acc.getAddress();
    interact.address = address;
     
    interact.getSwapAmount=async()=>await ask.ask(
        `How much do you want to swap?`,
        stdlib.parseCurrency
      );
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  );
  ctc = acc.contract(backend, info);

}

const part = role === "seller" ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);
ask.done();
