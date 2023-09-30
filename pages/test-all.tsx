import React, { useCallback, useState } from "react";
import styled from "styled-components";
import TestFramesPrepare from "@/pages/test-frames-prepare";
import TestFrames from "@/pages/test-frames";
import TestGpt from "@/pages/test-gpt";

export default function TestAll() {
  return (
    <Main>
      <TestGpt />
      <TestFramesPrepare />
      <TestFrames />
    </Main>
  );
}

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
