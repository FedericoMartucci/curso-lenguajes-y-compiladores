-- Esquema del backend. Se corre una sola vez, desde el SQL Editor del panel de Supabase.
--
-- Es deliberadamente chico: una fila por usuario con el progreso entero en un jsonb.
-- El progreso completo pesa unos 40 kB y se resuelve el conflicto en un solo lugar
-- (la función `fusionar` del cliente), en vez de tener una tabla de eventos que
-- habría que reconciliar con más código y sin ganar nada para este caso.

create table if not exists public.progreso (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  datos       jsonb       not null,
  actualizado timestamptz not null default now(),
  creado      timestamptz not null default now()
);

-- Seguridad por fila: cada quien ve y escribe solo lo suyo. Sin esto, la clave anónima
-- —que es pública y viaja en el bundle— dejaría leer el progreso de cualquiera.
alter table public.progreso enable row level security;

drop policy if exists "cada uno lee lo suyo"     on public.progreso;
drop policy if exists "cada uno inserta lo suyo" on public.progreso;
drop policy if exists "cada uno edita lo suyo"   on public.progreso;
drop policy if exists "cada uno borra lo suyo"   on public.progreso;

create policy "cada uno lee lo suyo"
  on public.progreso for select
  using (auth.uid() = user_id);

create policy "cada uno inserta lo suyo"
  on public.progreso for insert
  with check (auth.uid() = user_id);

create policy "cada uno edita lo suyo"
  on public.progreso for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cada uno borra lo suyo"
  on public.progreso for delete
  using (auth.uid() = user_id);

-- `actualizado` lo manda el cliente con la marca de tiempo del progreso, pero si viene
-- vacío o desfasado conviene tener el momento real de escritura.
create or replace function public.tocar_actualizado()
returns trigger
language plpgsql
as $$
begin
  if new.actualizado is null then
    new.actualizado := now();
  end if;
  return new;
end;
$$;

drop trigger if exists progreso_tocar_actualizado on public.progreso;
create trigger progreso_tocar_actualizado
  before insert or update on public.progreso
  for each row execute function public.tocar_actualizado();
