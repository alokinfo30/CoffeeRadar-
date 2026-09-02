/**
 * Enterprise Defense-in-Depth Security: CartSecurityValidator
 * Enforces 100% authoritative server-side price recalculation,
 * defeating client-side tampering, negative quantities, float manipulation, and NaN injection.
 */

import { AUTHORITATIVE_CATALOG, CoffeeItem } from '../data/catalog.js';

export interface RawCartItem {
  id: string;
  quantity: number | string | any;
  clientSubmittedPrice?: number | any;
  customizations?: {
    milkType?: string;
    extraShot?: boolean;
    syrupPump?: number;
  };
}

export interface ValidatedCartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  catalogItem: CoffeeItem;
  appliedCustomizations?: Record<string, any>;
  securityFlag?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  tamperingDetected: boolean;
  securityViolations: string[];
  items: ValidatedCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  recalculatedTimestamp: string;
}

export class CartSecurityValidator {
  private static TAX_RATE = 0.0825; // 8.25% municipal coffee tax

  public static validateAndRecalculate(rawItems: any[]): CartValidationResult {
    const violations: string[] = [];
    let tamperingDetected = false;

    if (!Array.isArray(rawItems)) {
      return {
        isValid: false,
        tamperingDetected: true,
        securityViolations: ['Cart payload must be a valid non-empty array.'],
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        recalculatedTimestamp: new Date().toISOString()
      };
    }

    const validatedItems: ValidatedCartItem[] = [];
    let authoritativeSubtotal = 0;

    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== 'object') {
        violations.push('Invalid cart item structure encountered.');
        tamperingDetected = true;
        continue;
      }

      const itemId = String(rawItem.id || '');
      const catalogItem = AUTHORITATIVE_CATALOG[itemId];

      if (!catalogItem) {
        violations.push(`Unrecognized item id "${itemId}" injected into cart.`);
        tamperingDetected = true;
        continue;
      }

      // Defend against NaN, Infinity, string coercion, negative quantities
      const rawQty = rawItem.quantity;
      if (typeof rawQty === 'string' && isNaN(Number(rawQty))) {
        violations.push(`Non-numeric quantity "${rawQty}" injected for item ${itemId}.`);
        tamperingDetected = true;
        continue;
      }

      const parsedQty = Math.floor(Number(rawQty));

      if (isNaN(parsedQty) || !isFinite(parsedQty)) {
        violations.push(`NaN / Infinity quantity injection detected for item ${itemId}.`);
        tamperingDetected = true;
        continue;
      }

      if (parsedQty <= 0) {
        violations.push(`Negative or zero quantity (${parsedQty}) rejected for item ${itemId}.`);
        tamperingDetected = true;
        continue;
      }

      if (parsedQty > 99) {
        violations.push(`Quantity overflow (${parsedQty}) exceeds max allowed per line item (99).`);
        tamperingDetected = true;
        continue;
      }

      // Check if client tried to manipulate the unit price
      const authoritativeUnitPrice = catalogItem.price;
      if (rawItem.clientSubmittedPrice !== undefined) {
        const clientPrice = Number(rawItem.clientSubmittedPrice);
        if (Math.abs(clientPrice - authoritativeUnitPrice) > 0.001) {
          violations.push(
            `Client price tampering detected on ${catalogItem.name}! Client sent $${clientPrice.toFixed(2)}, authoritative is $${authoritativeUnitPrice.toFixed(2)}.`
          );
          tamperingDetected = true;
        }
      }

      // Calculate customization surcharges authoritatively
      let itemUnitPrice = authoritativeUnitPrice;
      const appliedCustomizations: Record<string, any> = {};

      if (rawItem.customizations && typeof rawItem.customizations === 'object') {
        if (rawItem.customizations.extraShot === true) {
          itemUnitPrice += 1.00;
          appliedCustomizations.extraShot = '+ $1.00 Extra Espresso Ristretto';
        }
        if (rawItem.customizations.milkType === 'oat' || rawItem.customizations.milkType === 'almond') {
          itemUnitPrice += 0.75;
          appliedCustomizations.milkType = `+ $0.75 Barista ${rawItem.customizations.milkType} milk`;
        }
      }

      // Enforce safe 2-decimal arithmetic
      const lineTotal = Math.round(itemUnitPrice * parsedQty * 100) / 100;
      authoritativeSubtotal += lineTotal;

      validatedItems.push({
        id: itemId,
        name: catalogItem.name,
        quantity: parsedQty,
        unitPrice: itemUnitPrice,
        lineTotal,
        catalogItem,
        appliedCustomizations
      });
    }

    const subtotal = Math.round(authoritativeSubtotal * 100) / 100;
    const tax = Math.round(subtotal * this.TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
      isValid: validatedItems.length > 0 && !tamperingDetected,
      tamperingDetected,
      securityViolations: violations,
      items: validatedItems,
      subtotal,
      tax,
      total,
      recalculatedTimestamp: new Date().toISOString()
    };
  }
}
