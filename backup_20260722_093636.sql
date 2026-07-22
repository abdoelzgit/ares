--
-- PostgreSQL database dump
--

\restrict tcUgO8Xu6AlDdGSaXu8aLvakFe1uVLwkLthSQOQQLXrwMILekBySuNHGtWAgEHm

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: ConfidentialityLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ConfidentialityLevel" AS ENUM (
    'PUBLIC',
    'INTERNAL',
    'CONFIDENTIAL'
);


ALTER TYPE public."ConfidentialityLevel" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'DIREKTUR',
    'WAKASEK',
    'GURU',
    'PEMBINA',
    'TU',
    'KEUANGAN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: documents_search_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.documents_search_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.document_number, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$;


ALTER FUNCTION public.documents_search_trigger() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: archive_years; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archive_years (
    id uuid NOT NULL,
    year text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.archive_years OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_versions (
    id uuid NOT NULL,
    document_id uuid NOT NULL,
    version_number text NOT NULL,
    file_path text NOT NULL,
    is_cold_storage boolean DEFAULT false NOT NULL,
    uploaded_by_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.document_versions OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    title text NOT NULL,
    document_number text,
    description text,
    tags text[] DEFAULT ARRAY[]::text[],
    confidentiality_level public."ConfidentialityLevel" DEFAULT 'INTERNAL'::public."ConfidentialityLevel" NOT NULL,
    current_version_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    category_id uuid NOT NULL,
    school_year_id uuid
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: role_category_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_category_access (
    id uuid NOT NULL,
    role public."UserRole" NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_category_access OWNER TO postgres;

--
-- Name: user_category_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_category_access (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_category_access OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public."UserRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8a27efea-9b0b-4af2-acf1-abbae229e52b	0e271c4b5894935b65b7b1f6816e57bf57c1be5e0d7472fd86753099cbf16f68	2026-07-17 19:24:26.141195+07	20260716000000_init	\N	\N	2026-07-17 19:24:25.977607+07	1
74693114-1350-4782-986c-c8d21a18d58d	658498893ba8220e034a3287bc3b9c4184779b86d1dc829b0cdf41e41a705266	2026-07-17 19:24:26.16377+07	20260716151809_add_category_table	\N	\N	2026-07-17 19:24:26.142288+07	1
e96f686c-c3bd-4963-9b95-cbdd7332f745	8981694d20582a8568d3e568d449d67b5f2e2c425c2c8db80c9a7ac3396fd74b	2026-07-17 19:24:26.188414+07	20260716152235_link_category_relations	\N	\N	2026-07-17 19:24:26.164887+07	1
1c9c4b31-f1fa-4b59-8bfa-f12963f597f9	0b6cfe2249f371bddeaa06ff8403797f12b7e63fb027e44e85e8ed74518bf7a8	2026-07-17 19:34:19.038435+07	20260717123419_add_user_password	\N	\N	2026-07-17 19:34:19.029019+07	1
71bab881-8488-41c6-a24f-2ec7e9c58042	527938ee9bbc826486895d6faa75a7350903ef758cc75c8a1e57a7201570363f	2026-07-18 00:55:14.871265+07	20260717175514_add_role_category_access	\N	\N	2026-07-18 00:55:14.613442+07	1
0d4409af-39fa-4ea7-9daf-3fafbd8079ae	4a614c5ebe192e48039c7b531ebb7f7b116e0a9c29a9d894c1389842468b6821	2026-07-20 16:05:11.312717+07	20260720090511_add_user_category_access	\N	\N	2026-07-20 16:05:11.126958+07	1
fbf79b5e-6f79-4bff-84a9-cc6b4af78b1b	e91e2fa5b6f97cbf1a6e227440f878de5f12276383a484898681b55c24c56192	2026-07-21 13:50:49.905316+07	20260721065049_add_archive_year	\N	\N	2026-07-21 13:50:49.555001+07	1
\.


--
-- Data for Name: archive_years; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.archive_years (id, year, created_at) FROM stdin;
aa3dc5c7-c162-4962-bbef-c945ec6ca3f1	2026	2026-07-21 07:20:46.41
fd1c9b62-2227-4e89-880c-3d92c31f9684	2025	2026-07-21 07:21:36.509
e7c8ca71-03c7-4a9a-82d5-d5171d658fbd	2024	2026-07-21 07:21:40.717
67ed0f06-0db1-489a-8818-70b1188ef574	2023	2026-07-21 07:21:45.998
c563e1ef-1c6c-44b0-8b55-15b198fcee2e	2022	2026-07-21 07:22:03.923
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, code, name, created_at) FROM stdin;
f2e26ade-adb6-4767-aebe-49beef8e3a49	GOV	Tata Kelola	2026-07-17 13:22:33.721
6a147634-c90b-44d9-897f-a8dde9352b5f	CUR	Kurikulum	2026-07-17 13:22:33.737
87096707-bdf7-449b-a8cd-6705ada1742e	STU	Kesiswaan	2026-07-17 13:22:33.743
3034c462-f583-4c5d-818a-9090a78be5be	BRD	Boarding	2026-07-17 13:22:33.75
534ee209-af51-4025-923c-fc1e18174b3a	HRD	SDM	2026-07-17 13:22:33.755
194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	FIN	Keuangan	2026-07-17 13:22:33.761
2bed768b-e9a1-453d-9256-23b650da56ca	OPS	Operasional	2026-07-17 13:22:33.767
c4f5e61f-2930-4e39-ab9a-8f18a59ad62e	QMS	Penjamin Mutu	2026-07-17 13:22:33.772
31a8a783-d13a-4cc1-97aa-6758984ce31e	COM	Humas	2026-07-17 13:22:33.779
cc7e4ab8-3dc2-43dd-9d45-5f262a8b2f18	IT	Teknologi Informasi	2026-07-17 13:22:33.787
\.


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_versions (id, document_id, version_number, file_path, is_cold_storage, uploaded_by_id, created_at) FROM stdin;
6960370f-b0d5-40ed-9c33-4f6e1965fb4d	dbf35b18-98aa-43c2-af48-6a667842f311	v1.0	/uploads/5a5cb141-d975-4ba9-b58f-eef100cbe283.pdf	f	56f08f74-9a4a-4581-a596-e206b29776ff	2026-07-17 13:24:52.279
ae503f20-cd25-4a5b-8c50-d400bb2982e0	1e360faa-2461-46f0-81fb-7933c02ceffd	v1.0	/uploads/3ad0c682-7ad5-42d5-baaf-43ccc0b5cd13.pdf	f	db5da04b-d6b3-4648-b4bc-854f5993312d	2026-07-20 07:53:45.356
b497830a-e2f1-46a7-b3ea-08fe09da0d1c	a857d31c-de5d-4ae2-97a7-af98597fb020	v1.0	/uploads/ae5daadf-0ed9-47bc-98bd-4c3072979cf2.pdf	f	56f08f74-9a4a-4581-a596-e206b29776ff	2026-07-20 08:14:00.594
1ed0247c-2aa8-4900-9e32-65a20158407f	5b932647-c72a-48a9-b077-83233a11b589	v1.0	/uploads/0129368c-0e1a-49e1-a1b1-3c072b869881.pdf	f	56f08f74-9a4a-4581-a596-e206b29776ff	2026-07-20 08:15:25.769
c8dc4898-d2cb-4923-9183-19501f5460b9	477e31be-8346-43fc-82f5-932be9beb448	v1.0	/uploads/a983912f-472a-4fdb-b316-8ec5b23aea6d.pdf	f	50c3202d-e718-4786-a211-5eaf5d713a1f	2026-07-21 05:24:04.742
ec152bd0-af51-4b59-b7a1-b36b421199ac	fe9e2376-099d-43a9-9d38-eea5d843011c	v1.0	/uploads/546cbb16-0080-49a9-b2c8-ef8e3f204bad.pdf	f	56f08f74-9a4a-4581-a596-e206b29776ff	2026-07-21 07:32:23.872
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, title, document_number, description, tags, confidentiality_level, current_version_id, created_at, updated_at, category_id, school_year_id) FROM stdin;
dbf35b18-98aa-43c2-af48-6a667842f311	CV_Abdul	vjajpjop	\N	{}	INTERNAL	6960370f-b0d5-40ed-9c33-4f6e1965fb4d	2026-07-17 13:24:52.263	2026-07-17 13:24:52.299	6a147634-c90b-44d9-897f-a8dde9352b5f	\N
1e360faa-2461-46f0-81fb-7933c02ceffd	aknkakaskn	qknsfdaskn	\N	{}	INTERNAL	ae503f20-cd25-4a5b-8c50-d400bb2982e0	2026-07-20 07:53:45.295	2026-07-20 07:53:45.389	3034c462-f583-4c5d-818a-9090a78be5be	\N
a857d31c-de5d-4ae2-97a7-af98597fb020	LPJ bulan mei	FIN-LPJ Bulan mei-2026	\N	{}	INTERNAL	b497830a-e2f1-46a7-b3ea-08fe09da0d1c	2026-07-20 08:14:00.583	2026-07-20 08:14:00.606	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	\N
5b932647-c72a-48a9-b077-83233a11b589	RKAS	001	\N	{}	INTERNAL	1ed0247c-2aa8-4900-9e32-65a20158407f	2026-07-20 08:15:25.761	2026-07-20 08:15:25.779	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	\N
477e31be-8346-43fc-82f5-932be9beb448	FIN-001_LPJ_BULAN_Juni_2027	001	\N	{}	INTERNAL	c8dc4898-d2cb-4923-9183-19501f5460b9	2026-07-21 05:24:04.71	2026-07-21 05:26:58.514	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	\N
fe9e2376-099d-43a9-9d38-eea5d843011c	CUR-001_MODUL_AJAR_MATEMATIKA_2026	001	\N	{}	INTERNAL	ec152bd0-af51-4b59-b7a1-b36b421199ac	2026-07-21 07:32:23.85	2026-07-21 07:32:23.889	6a147634-c90b-44d9-897f-a8dde9352b5f	aa3dc5c7-c162-4962-bbef-c945ec6ca3f1
\.


--
-- Data for Name: role_category_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_category_access (id, role, category_id, created_at) FROM stdin;
008e8f9a-ece6-4e40-8480-72fc81ae62e7	KEUANGAN	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	2026-07-20 10:35:35.127
5825761f-c3ab-4582-936e-b5f5ab666915	PEMBINA	3034c462-f583-4c5d-818a-9090a78be5be	2026-07-20 10:35:35.15
9e7a39f0-e5da-493f-a014-e8cfddc406f7	TU	2bed768b-e9a1-453d-9256-23b650da56ca	2026-07-20 10:35:35.162
\.


--
-- Data for Name: user_category_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_category_access (id, user_id, category_id, created_at) FROM stdin;
40a1496c-a458-4480-ad5e-6d6d708f5d75	db5da04b-d6b3-4648-b4bc-854f5993312d	cc7e4ab8-3dc2-43dd-9d45-5f262a8b2f18	2026-07-20 10:08:23.338
c368d993-2869-4ef5-ab04-381f525c7444	1a2b3bb3-d669-4136-ab51-3ea78e858978	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	2026-07-20 10:24:21.353
cccee5e9-6380-4a5f-b065-074e7c820c3b	1a2b3bb3-d669-4136-ab51-3ea78e858978	87096707-bdf7-449b-a8cd-6705ada1742e	2026-07-20 10:24:21.353
bf36be86-4162-4b13-ac11-2db613d5bb6e	d9a28504-3fe9-4a77-82ad-25311719f0e4	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	2026-07-20 13:31:04.804
b8bc8073-fd49-49dd-a1ba-40cfeeda7b1b	d9a28504-3fe9-4a77-82ad-25311719f0e4	87096707-bdf7-449b-a8cd-6705ada1742e	2026-07-20 13:31:04.804
d7cac9d8-12d4-4808-9dec-3164535a7dc6	eb541e36-a72b-4719-90f4-b711bc3f641c	87096707-bdf7-449b-a8cd-6705ada1742e	2026-07-20 13:37:17.926
a965b2a1-6390-4fe4-b8a9-2d31c5108d61	eb541e36-a72b-4719-90f4-b711bc3f641c	6a147634-c90b-44d9-897f-a8dde9352b5f	2026-07-20 13:37:17.926
3a30cb6e-b4c0-4fc2-96fe-f151670a2980	50c3202d-e718-4786-a211-5eaf5d713a1f	87096707-bdf7-449b-a8cd-6705ada1742e	2026-07-20 13:41:21.73
023635e9-3766-4634-91cb-d975b501e349	50c3202d-e718-4786-a211-5eaf5d713a1f	194c7c48-1c3f-4f27-b7c3-a8c4d6253ae8	2026-07-20 13:41:21.73
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, created_at, password) FROM stdin;
56f08f74-9a4a-4581-a596-e206b29776ff	Admin	admin@school.sch.id	DIREKTUR	2026-07-17 13:09:10.084	$2b$10$ZzGfLKdcVzfDmDnmJMh/fObknLlrNW5JiKwQgVKPb8Bk3qou7SRdq
db5da04b-d6b3-4648-b4bc-854f5993312d	Ahmad Rifai	ahmad@school.sch.id	GURU	2026-07-17 13:39:12.959	$2b$10$xAGfqUzz33k5CO7CeK64SeqMfCNVFVM.G0hm77hh/xnUBPHOpGHEW
1a2b3bb3-d669-4136-ab51-3ea78e858978	nanang	nanang@school.sch.id	GURU	2026-07-20 09:34:05.297	$2b$10$rGP6VkrvlUOVCnBNI.q6sO3QjbYJxJjKurzYAC35F14t/hrhQIK.u
d9a28504-3fe9-4a77-82ad-25311719f0e4	bila	bila@school.sch.id	KEUANGAN	2026-07-20 10:36:50.913	$2b$10$c4iNq31pb7eaqEts3t7g3eAIIfz/IImX6rNrnZV.ECTuWJXaVKuSu
eb541e36-a72b-4719-90f4-b711bc3f641c	Budi	budi@school.sch.id	WAKASEK	2026-07-20 08:00:47.642	$2b$10$xUeZ.VuzJQUQDG5BgfT1sulcG1bDWCeJGr2yzwgPxcw9FlwbalvDO
50c3202d-e718-4786-a211-5eaf5d713a1f	resa	resa@school.sch.id	TU	2026-07-20 13:41:21.73	$2b$10$VcPFi5e0ZsGSMf0M0vBcWuEnJ.Pr.5Xg/ask7hp5HPY8r3aHW/CRm
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: archive_years archive_years_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archive_years
    ADD CONSTRAINT archive_years_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: role_category_access role_category_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_category_access
    ADD CONSTRAINT role_category_access_pkey PRIMARY KEY (id);


--
-- Name: user_category_access user_category_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_category_access
    ADD CONSTRAINT user_category_access_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: archive_years_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX archive_years_year_key ON public.archive_years USING btree (year);


--
-- Name: categories_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_code_key ON public.categories USING btree (code);


--
-- Name: document_versions_document_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX document_versions_document_id_idx ON public.document_versions USING btree (document_id);


--
-- Name: documents_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_category_id_idx ON public.documents USING btree (category_id);


--
-- Name: documents_current_version_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX documents_current_version_id_key ON public.documents USING btree (current_version_id);


--
-- Name: documents_school_year_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_school_year_id_idx ON public.documents USING btree (school_year_id);


--
-- Name: role_category_access_role_category_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_category_access_role_category_id_key ON public.role_category_access USING btree (role, category_id);


--
-- Name: role_category_access_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX role_category_access_role_idx ON public.role_category_access USING btree (role);


--
-- Name: user_category_access_user_id_category_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_category_access_user_id_category_id_key ON public.user_category_access USING btree (user_id, category_id);


--
-- Name: user_category_access_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_category_access_user_id_idx ON public.user_category_access USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: document_versions document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_versions document_versions_uploaded_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_uploaded_by_id_fkey FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_current_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_current_version_id_fkey FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: documents documents_school_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_school_year_id_fkey FOREIGN KEY (school_year_id) REFERENCES public.archive_years(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_category_access role_category_access_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_category_access
    ADD CONSTRAINT role_category_access_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_category_access user_category_access_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_category_access
    ADD CONSTRAINT user_category_access_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_category_access user_category_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_category_access
    ADD CONSTRAINT user_category_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict tcUgO8Xu6AlDdGSaXu8aLvakFe1uVLwkLthSQOQQLXrwMILekBySuNHGtWAgEHm

