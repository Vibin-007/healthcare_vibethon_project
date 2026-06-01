-- Execute this script in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

create type user_role as enum ('patient', 'doctor', 'nurse');
create type med_status as enum ('taken', 'missed', 'pending');

create table users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role user_role not null default 'patient',
  created_at timestamptz default now()
);

create table patients (
  patient_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id) on delete cascade,
  name text,
  age int4,
  gender text,
  phone text,
  address text,
  disease_condition text,
  assigned_nurse_id uuid,
  assigned_doctor_id uuid,
  created_at timestamptz default now()
);

create table doctors (
  doctor_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id),
  specialization text,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table nurses (
  nurse_id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(user_id),
  phone text,
  address text,
  created_at timestamptz default now()
);

create table health_logs (
  log_id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(patient_id) on delete cascade,
  nurse_id uuid references nurses(nurse_id),
  doctor_id uuid references doctors(doctor_id),
  sleep_hours numeric,
  heart_rate int4,
  blood_pressure text,
  pain_level int4,
  symptoms text,
  notes text,
  log_date date default current_date,
  created_at timestamptz default now()
);

create table medications (
  medication_id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(patient_id) on delete cascade,
  medicine_name text not null,
  dosage text,
  frequency text,
  time time,
  status med_status default 'pending',
  created_at timestamptz default now()
);

create table ai_insights (
  insight_id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(patient_id) on delete cascade,
  log_id uuid references health_logs(log_id),
  insight_message text,
  generated_at timestamptz default now()
);

alter table patients enable row level security;
alter table health_logs enable row level security;
alter table medications enable row level security;
alter table ai_insights enable row level security;

create policy "Patients own data" on patients for all using (user_id = auth.uid());
create policy "Patient logs" on health_logs for all using (
  patient_id in (select patient_id from patients where user_id = auth.uid())
);
create policy "Patient meds" on medications for all using (
  patient_id in (select patient_id from patients where user_id = auth.uid())
);
create policy "Patient insights" on ai_insights for all using (
  patient_id in (select patient_id from patients where user_id = auth.uid())
);

