/**
 * Hero entity - Core domain model
 * Represents a superhero in the system
 */
export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
}

/**
 * DTO for creating a new hero
 * The system generates id and createdAt
 */
export interface CreateHeroDto {
  readonly name: string;
  readonly description?: string;
}

/**
 * DTO for updating an existing hero
 * All fields are optional (partial update)
 */
export interface UpdateHeroDto {
  readonly name?: string;
  readonly description?: string;
}