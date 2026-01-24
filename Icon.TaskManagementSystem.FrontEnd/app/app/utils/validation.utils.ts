import { z } from 'zod';

/**
 * Recursively traverses an object or array, and checks and compares the default value 
 * in the zod schema with the current element, and if it matches the default, 
 * removes it from the result object/array.
 * 
 * @param obj The object/array to clean
 * @param schema The Zod schema to reference for default values
 * @returns A new object/array with default values removed
 */
export function removeDefaultValuesFromObject<T>(
  obj: T,
  schema: z.ZodSchema<T>
): T {
  // Handle primitive types and null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  const defaultInfo = getDefaultInfoFromSchema(schema);

  if (defaultInfo.isOptional && (obj === null || obj === undefined)
      || ('defaultValue' in defaultInfo && isEqual(obj, defaultInfo.defaultValue))) {
    return undefined as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const schemaDef = returnInstanceIfFound(schema, z.ZodArray);
    if (schemaDef) {
      const elementSchema = schemaDef.def.element;
      const result = obj
        .map(item => removeDefaultValuesFromObject(item, elementSchema as any))
        .filter(item => item !== undefined);
      return result as T;
    }
    return obj as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    const objectSchemaDef = returnInstanceIfFound(schema, z.ZodObject);
    const recordSchemaDef = returnInstanceIfFound(schema, z.ZodRecord);
    const shape = objectSchemaDef?.shape;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        // Get the schema for this key if it exists
        if (shape && shape[key]) {

          const keySchema: z.ZodTypeAny = shape[key];
          
          // Check if the current value matches the default value of the schema
          const defaultInfo = getDefaultInfoFromSchema(keySchema);
          
          // Only add to result if value doesn't match default
          if (defaultInfo.isOptional && (value === null || value === undefined)) {
            continue;
          }
          if ('defaultValue' in defaultInfo && isEqual(value, defaultInfo.defaultValue)) {
            continue;
          }

          // Recursively process nested objects/arrays
          const resultForKey = removeDefaultValuesFromObject(value, keySchema);

          if (resultForKey !== undefined) {
            result[key] = resultForKey;
          }
        } else if (recordSchemaDef) {
          // Handle ZodRecord case
          const valueSchema = recordSchemaDef.def.valueType as z.ZodTypeAny;
          const resultForKey = removeDefaultValuesFromObject(value, valueSchema);
          if (resultForKey !== undefined) {
            result[key] = resultForKey;
          }
        } else {
          // If no schema for this key, just copy the value
          result[key] = value;
        }
      }
    }
    
    return result as T;
  }

  return obj;
}

/**
 * Helper function to extract the default value from a Zod schema
 */
function getDefaultInfoFromSchema(schema: z.ZodTypeAny): { isOptional: boolean; defaultValue?: any } {
  const defaultInstance = returnInstanceIfFound(schema, z.ZodDefault);
  return { 
    isOptional: schema instanceof z.ZodOptional || schema instanceof z.ZodExactOptional, 
    ...(
      defaultInstance 
        ? { defaultValue: defaultInstance.def.defaultValue } 
        : {}
    ) 
  };
}

function returnInstanceIfFound<T>(schema: z.ZodTypeAny, instanceType: new (...args: any[]) => T): T | undefined {
  if (schema instanceof instanceType) {
    return schema as unknown as T;
  }
  
  if ((schema instanceof z.ZodOptional || schema instanceof z.ZodDefault || schema instanceof z.ZodNullable) && schema.def.innerType != null) {
    return returnInstanceIfFound(schema.def.innerType as z.ZodTypeAny, instanceType);
  }
  return undefined;
}

/**
 * Helper function to compare two values for equality
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}