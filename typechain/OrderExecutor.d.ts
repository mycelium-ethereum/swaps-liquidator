/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface OrderExecutorInterface extends ethers.utils.Interface {
  functions: {
    "BASIS_POINTS_DIVISOR()": FunctionFragment;
    "executeDecreaseOrder(address,uint256,address)": FunctionFragment;
    "executeIncreaseOrder(address,uint256,address)": FunctionFragment;
    "executeSwapOrder(address,uint256,address)": FunctionFragment;
    "orderBook()": FunctionFragment;
    "vault()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "BASIS_POINTS_DIVISOR",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "executeDecreaseOrder",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "executeIncreaseOrder",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "executeSwapOrder",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(functionFragment: "orderBook", values?: undefined): string;
  encodeFunctionData(functionFragment: "vault", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "BASIS_POINTS_DIVISOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeDecreaseOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeIncreaseOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeSwapOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "orderBook", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vault", data: BytesLike): Result;

  events: {};
}

export class OrderExecutor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: OrderExecutorInterface;

  functions: {
    BASIS_POINTS_DIVISOR(overrides?: CallOverrides): Promise<[BigNumber]>;

    executeDecreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    executeIncreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    executeSwapOrder(
      _account: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    orderBook(overrides?: CallOverrides): Promise<[string]>;

    vault(overrides?: CallOverrides): Promise<[string]>;
  };

  BASIS_POINTS_DIVISOR(overrides?: CallOverrides): Promise<BigNumber>;

  executeDecreaseOrder(
    _address: string,
    _orderIndex: BigNumberish,
    _feeReceiver: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  executeIncreaseOrder(
    _address: string,
    _orderIndex: BigNumberish,
    _feeReceiver: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  executeSwapOrder(
    _account: string,
    _orderIndex: BigNumberish,
    _feeReceiver: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  orderBook(overrides?: CallOverrides): Promise<string>;

  vault(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    BASIS_POINTS_DIVISOR(overrides?: CallOverrides): Promise<BigNumber>;

    executeDecreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: CallOverrides
    ): Promise<void>;

    executeIncreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: CallOverrides
    ): Promise<void>;

    executeSwapOrder(
      _account: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: CallOverrides
    ): Promise<void>;

    orderBook(overrides?: CallOverrides): Promise<string>;

    vault(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    BASIS_POINTS_DIVISOR(overrides?: CallOverrides): Promise<BigNumber>;

    executeDecreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    executeIncreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    executeSwapOrder(
      _account: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    orderBook(overrides?: CallOverrides): Promise<BigNumber>;

    vault(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    BASIS_POINTS_DIVISOR(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    executeDecreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    executeIncreaseOrder(
      _address: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    executeSwapOrder(
      _account: string,
      _orderIndex: BigNumberish,
      _feeReceiver: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    orderBook(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    vault(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}