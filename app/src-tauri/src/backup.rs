use serde_json::Value;

fn ensure_arrays(payload: &Value) -> bool {
  payload.get("lists").is_some_and(Value::is_array)
    && payload.get("items").is_some_and(Value::is_array)
    && payload.get("snapshots").is_some_and(Value::is_array)
}

fn ensure_version(payload: &Value) -> bool {
  payload.get("version").and_then(Value::as_str) == Some("1.0.0")
}

pub fn validate_payload(raw: &str) -> Result<Value, String> {
  let payload: Value = serde_json::from_str(raw)
    .map_err(|error| format!("invalid backup JSON: {error}"))?;

  if !ensure_version(&payload) {
    return Err("unsupported backup version".to_string());
  }

  if !ensure_arrays(&payload) {
    return Err("backup payload missing required lists/items/snapshots".to_string());
  }

  Ok(payload)
}
