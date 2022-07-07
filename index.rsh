'reach 0.1'

const commonInteract = {
  ...hasRandom,
  reportAcceptSwap: Fun([], Null),
  reportDeclineSwap:Fun([], Null),
  confirmSwap: Fun([UInt], Bool),
  reportAddressMissmatch: Fun([], Null),
  

};
const sellerInteract = {
  ...commonInteract,
  getBuyerAddress: Fun([], Address),
  swapAmount: UInt,

};
const buyerInteract = {
  ...commonInteract,
  getSwapAmount: Fun([], UInt),
  address: Address,

};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', sellerInteract);
  const Bob = Participant('Bob', buyerInteract);
  init();

  
  Alice.only(() => { 
    const sSwapAmount = declassify(interact.swapAmount);
   });

  Alice.publish(sSwapAmount).pay(sSwapAmount);
  commit();

  Alice.only(() => { 
    const buyerAddress = declassify(interact.getBuyerAddress());
  
   });
  Alice.publish(buyerAddress);
  commit();



   Bob.only(() => { 
        const willSwap = declassify(interact.confirmSwap(sSwapAmount)); 
        const bobAddress = declassify(interact.address); 
        });
      Bob.publish(willSwap, bobAddress);

if(bobAddress!=buyerAddress){
    transfer(sSwapAmount).to(Alice);
  commit();
   each([Alice, Bob], () => {
      interact.reportAddressMissmatch();
    });
  exit();
}
      if (!willSwap) {
transfer(sSwapAmount).to(Alice);
        commit();
           Alice.interact.reportDeclineSwap();
      exit();
      } else {
          Alice.interact.reportAcceptSwap();
        commit();
      }



Bob.only(() => { 
    const bSwapAmount = declassify(interact.getSwapAmount()); 
    });
  Bob.publish(bSwapAmount).pay(bSwapAmount);
  commit();

  Alice.only(() => { const sWillSwap = declassify(interact.confirmSwap(bSwapAmount)); });
  Alice.publish(sWillSwap);
if(sWillSwap){
          Bob.interact.reportAcceptSwap();
    transfer(bSwapAmount).to(Alice);
    transfer(sSwapAmount).to(Bob);
    commit();
    }else{
      transfer(bSwapAmount).to(Bob);
    transfer(sSwapAmount).to(Alice);
      commit();
       Bob.interact.reportDeclineSwap();
        }
  


  
  exit();
  });