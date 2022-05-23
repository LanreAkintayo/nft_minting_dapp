import {ethers} from "ethers"

export const toDecimal = (value, decimal) => {
 return Number(value).toFixed(decimal)
}

export const ether = (value) => {
 return ethers.utils.parseUnits(value.toString(), "ether")
}