# Databricks notebook source
# MAGIC %md
# MAGIC # Compliance Analysis
# MAGIC Identifies non-compliant spending and policy violations

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from datetime import datetime
import math

# COMMAND ----------

# Get parameters
catalog = dbutils.widgets.get("catalog") if dbutils.widgets.get("catalog") else "main"
schema = dbutils.widgets.get("schema") if dbutils.widgets.get("schema") else "procurement_analytics"

spark.sql(f"USE {catalog}.{schema}")

# COMMAND ----------

# Load contract data
contracts_df = spark.table(f"{catalog}.{schema}.contracts")

# COMMAND ----------

def seeded_random(seed: int) -> float:
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def get_health_status(score: float) -> str:
    if score >= 80:
        return "good"
    elif score >= 60:
        return "warning"
    else:
        return "critical"

# COMMAND ----------

def analyze_compliance(row):
    contract_id = row['id']
    spent = row['spent']
    seed = int(''.join(filter(str.isdigit, contract_id)) or '12345')
    
    # Calculate compliance metrics
    non_compliant_amount = int(seeded_random(seed + 2) * spent * 0.12)
    violations = int(seeded_random(seed + 3) * 8) + 1
    score = 100 - (non_compliant_amount / spent) * 100
    status = get_health_status(score)
    
    return {
        'contract_id': contract_id,
        'analysis_type': 'non-compliant-spending',
        'status': status,
        'violations': violations,
        'non_compliant_amount': non_compliant_amount,
        'compliance_rate': round(score, 0),
        'percentage': round((non_compliant_amount / spent) * 100, 1),
        'severity': 'low' if status == 'good' else ('medium' if status == 'warning' else 'high'),
        'risk_level': status.title(),
        'detected_at': datetime.now().isoformat()
    }

# COMMAND ----------

# Process compliance analysis
compliance_rdd = contracts_df.rdd.map(analyze_compliance)

compliance_schema = StructType([
    StructField("contract_id", StringType(), False),
    StructField("analysis_type", StringType(), False),
    StructField("status", StringType(), False),
    StructField("violations", IntegerType(), False),
    StructField("non_compliant_amount", LongType(), False),
    StructField("compliance_rate", DoubleType(), False),
    StructField("percentage", DoubleType(), False),
    StructField("severity", StringType(), False),
    StructField("risk_level", StringType(), False),
    StructField("detected_at", StringType(), False)
])

compliance_df = spark.createDataFrame(compliance_rdd, schema=compliance_schema)

# COMMAND ----------

# Save results
compliance_df.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.compliance_analysis")

print(f"Analyzed {compliance_df.count()} contracts for compliance")

# COMMAND ----------

# Display results
display(compliance_df.orderBy(col("severity").desc(), col("non_compliant_amount").desc()))

# COMMAND ----------

# Summary
summary = compliance_df.groupBy("status", "risk_level").agg(
    count("contract_id").alias("count"),
    sum("non_compliant_amount").alias("total_non_compliant"),
    avg("compliance_rate").alias("avg_compliance_rate")
)

display(summary)

# COMMAND ----------

# Export metrics
high_risk_count = compliance_df.filter(col("severity") == "high").count()
total_violations = compliance_df.agg(sum("violations")).collect()[0][0]

dbutils.jobs.taskValues.set(key="high_risk_contracts", value=high_risk_count)
dbutils.jobs.taskValues.set(key="total_violations", value=total_violations)

print(f"Compliance analysis completed! Found {high_risk_count} high-risk contracts")

