export type RiskLevel = 'SAFE' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  description?: string;
  created_at?: string;
}

export interface LayoutObject {
  id: string;
  layout_id?: string;
  type: 'robot' | 'workstation' | 'conveyor' | 'obstacle' | 'restricted_zone';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface Waypoint {
  x: number;
  y: number;
  speed: number;
  dwell_time?: number;
}

export interface EntityPath {
  id: string;
  entity_type: 'robot' | 'human';
  entity_id: string;
  waypoints: Waypoint[];
}

export interface RiskEvent {
  timestep: number;
  timestamp_sec: number;
  risk_level: RiskLevel;
  distance_actual: number;
  distance_required: number;
  robot_pos: { x: number; y: number };
  human_pos: { x: number; y: number };
  robot_speed: number;
  human_speed: number;
  explanation: string;
  recommended_action: string;
  confidence: number;
}

export interface SimulationSummary {
  mode: 'static' | 'dynamic';
  duration_seconds: number;
  total_timesteps: number;
  min_distance_m: number;
  num_unsafe_events: number;
  num_robot_stops: number;
  total_stop_duration_sec: number;
  restricted_production_pct: number;
  near_misses: number;
  total_risk_events_logged: number;
}

export interface TimestepData {
  step: number;
  timestamp: number;
  robot: { x: number; y: number; speed: number };
  human: { x: number; y: number; speed: number };
  actual_distance: number;
  required_separation: number;
  risk_level: RiskLevel;
  confidence: number;
  breakdown: Record<string, number>;
}

export interface SimulationResult {
  run_id?: string;
  summary: SimulationSummary;
  timesteps: TimestepData[];
  risk_events: RiskEvent[];
}

export interface SensitivitySweepItem {
  parameter: string;
  value: number;
  robot_speed: number;
  human_speed: number;
  required_separation_m: number;
  min_distance_m: number;
  risk_level: RiskLevel;
  num_unsafe_events: number;
  recommended_action: string;
}

export interface UserFeedback {
  id?: string;
  user_role: string;
  ease_of_use: number;
  clarity_rating: number;
  confidence_rating: number;
  language_usability: number;
  comments?: string;
  created_at?: string;
}
