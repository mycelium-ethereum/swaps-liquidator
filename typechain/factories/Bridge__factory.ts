/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Bridge, BridgeInterface } from "../Bridge";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_wToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "gov",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gov",
        type: "address",
      },
    ],
    name: "setGov",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "unwrap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "wrap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516108213803806108218339818101604052604081101561003357600080fd5b5080516020909101516001600081905580546001600160a01b03199081163317909155600280546001600160a01b03948516908316179055600380549390921692169190911790556107978061008a6000396000f3fe608060405234801561001057600080fd5b506004361061006d5760003560e01c806301e33667146100725780630babd864146100aa57806312d43a51146100ce57806313bac820146100d65780637647691d14610102578063cfad57a21461012e578063fc0c546a14610154575b600080fd5b6100a86004803603606081101561008857600080fd5b506001600160a01b0381358116916020810135909116906040013561015c565b005b6100b26101cc565b604080516001600160a01b039092168252519081900360200190f35b6100b26101db565b6100a8600480360360408110156100ec57600080fd5b50803590602001356001600160a01b03166101ea565b6100a86004803603604081101561011857600080fd5b50803590602001356001600160a01b031661026d565b6100a86004803603602081101561014457600080fd5b50356001600160a01b03166102e7565b6100b2610360565b6001546001600160a01b031633146101b3576040805162461bcd60e51b815260206004820152601560248201527423b7bb32b93730b136329d103337b93134b23232b760591b604482015290519081900360640190fd5b6101c76001600160a01b038416838361036f565b505050565b6003546001600160a01b031681565b6001546001600160a01b031681565b60026000541415610230576040805162461bcd60e51b815260206004820152601f60248201526000805160206106f2833981519152604482015290519081900360640190fd5b600260008190555461024d906001600160a01b03163330856103c1565b600354610264906001600160a01b0316828461036f565b50506001600055565b600260005414156102b3576040805162461bcd60e51b815260206004820152601f60248201526000805160206106f2833981519152604482015290519081900360640190fd5b60026000556003546102d0906001600160a01b03163330856103c1565b600254610264906001600160a01b0316828461036f565b6001546001600160a01b0316331461033e576040805162461bcd60e51b815260206004820152601560248201527423b7bb32b93730b136329d103337b93134b23232b760591b604482015290519081900360640190fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b6002546001600160a01b031681565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180516001600160e01b031663a9059cbb60e01b1790526101c7908490610421565b604080516001600160a01b0380861660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b17905261041b908590610421565b50505050565b6060610476826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166104d29092919063ffffffff16565b8051909150156101c75780806020019051602081101561049557600080fd5b50516101c75760405162461bcd60e51b815260040180806020018281038252602a815260200180610738602a913960400191505060405180910390fd5b60606104e184846000856104eb565b90505b9392505050565b60608247101561052c5760405162461bcd60e51b81526004018080602001828103825260268152602001806107126026913960400191505060405180910390fd5b61053585610647565b610586576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b60006060866001600160a01b031685876040518082805190602001908083835b602083106105c55780518252601f1990920191602091820191016105a6565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114610627576040519150601f19603f3d011682016040523d82523d6000602084013e61062c565b606091505b509150915061063c82828661064d565b979650505050505050565b3b151590565b6060831561065c5750816104e4565b82511561066c5782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156106b657818101518382015260200161069e565b50505050905090810190601f1680156106e35780820380516001836020036101000a031916815260200191505b509250505060405180910390fdfe5265656e7472616e637947756172643a207265656e7472616e742063616c6c00416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c5361666545524332303a204552433230206f7065726174696f6e20646964206e6f742073756363656564a26469706673582212207162cbfc4675c5f29f8e94de4fc1e9cfb22fa21f367740d5fd8481afa4d3f3aa64736f6c634300060c0033";

export class Bridge__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _token: string,
    _wToken: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Bridge> {
    return super.deploy(_token, _wToken, overrides || {}) as Promise<Bridge>;
  }
  getDeployTransaction(
    _token: string,
    _wToken: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_token, _wToken, overrides || {});
  }
  attach(address: string): Bridge {
    return super.attach(address) as Bridge;
  }
  connect(signer: Signer): Bridge__factory {
    return super.connect(signer) as Bridge__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BridgeInterface {
    return new utils.Interface(_abi) as BridgeInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Bridge {
    return new Contract(address, _abi, signerOrProvider) as Bridge;
  }
}
