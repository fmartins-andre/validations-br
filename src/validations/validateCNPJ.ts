/**
 * Reference: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj
 */

const cnpjSizeWithoutDv: number = 12;
const cnpjRegexWithoutDv: RegExp = /^([A-Z\d]){12}$/;
const cnpjRegex: RegExp = /^([A-Z\d]){12}(\d){2}$/;
const maskCharactersRegex: RegExp = /[./-]/g;
const notAllowedCharactersRegex: RegExp = /[^A-Z\d./-]/i;
const baseValue: number = '0'.charCodeAt(0);
const dvWeights: number[] = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const zeroedCnpj: string = '00000000000000';

function removeCnpjMask(cnpj: string): string {
  return cnpj.replace(maskCharactersRegex, '');
}

function calcCnpjDv(cnpj: string): string {
  if (!notAllowedCharactersRegex.test(cnpj)) {
    const cnpjSemMascara = removeCnpjMask(cnpj);
    if (
      cnpjRegexWithoutDv.test(cnpjSemMascara) &&
      cnpjSemMascara !== zeroedCnpj.substring(0, cnpjSizeWithoutDv)
    ) {
      let somatorioDV1 = 0;
      let somatorioDV2 = 0;
      for (let i = 0; i < cnpjSizeWithoutDv; i++) {
        const asciiDigito = cnpjSemMascara.charCodeAt(i) - baseValue;
        somatorioDV1 += asciiDigito * dvWeights[i + 1];
        somatorioDV2 += asciiDigito * dvWeights[i];
      }
      const dv1 = somatorioDV1 % 11 < 2 ? 0 : 11 - (somatorioDV1 % 11);
      somatorioDV2 += dv1 * dvWeights[cnpjSizeWithoutDv];
      const dv2 = somatorioDV2 % 11 < 2 ? 0 : 11 - (somatorioDV2 % 11);
      return `${dv1}${dv2}`;
    }
  }
  throw new Error(
    'Não é possível calcular o DV pois o CNPJ fornecido é inválido',
  );
}

function isValidCnpj(cnpj: string): boolean {
  if (!notAllowedCharactersRegex.test(cnpj)) {
    const unmaskedCnpj = removeCnpjMask(cnpj);
    if (cnpjRegex.test(unmaskedCnpj) && unmaskedCnpj !== zeroedCnpj) {
      const givenDv = unmaskedCnpj.substring(cnpjSizeWithoutDv);
      const calculatedDv = calcCnpjDv(
        unmaskedCnpj.substring(0, cnpjSizeWithoutDv),
      );
      return givenDv === calculatedDv;
    }
  }
  return false;
}

/**
 * The function `validateCNPJ` validates a Brazilian CNPJ number.
 * @param {string} value - The `value` parameter is a string that represents the CNPJ (Cadastro
 * Nacional da Pessoa Jurídica) number to be validated. It can be formatted with or without punctuation,
 * like '00.000.000/0000-00' or '00000000000000'.
 * @returns The function `validateCNPJ` returns a boolean value. It returns `true` if the CNPJ is
 * valid, and `false` otherwise.
 */
export function validateCNPJ(value: string): boolean {
  return isValidCnpj(value);
}
